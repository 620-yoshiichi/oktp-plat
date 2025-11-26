import prisma from 'src/lib/prisma'

export const createUpassFamilyTree = async () => {
  const result = {}

  // 初回ファミリーツリーの作成
  const firstUpassDataList = await prisma.uPASS.findMany({
    where: {
      AND: [
        {dataSource: 'upass'},
        {MyUpassTree: null},
        {
          OR: [
            //
            {previousAssessmentnumber: ''},
            {previousAssessmentnumber: null},
          ],
        },
      ],
    },
  })

  result['firstUpassDataList'] = firstUpassDataList

  for (let i = 0; i < firstUpassDataList.length; i++) {
    const satei = firstUpassDataList[i]

    let current: string | undefined = satei.sateiID

    const tree: string[] = []

    while (current) {
      tree.push(current)

      const child = await prisma.uPASS.findFirst({
        where: {previousAssessmentnumber: current},
      })

      current = child?.sateiID
    }

    await prisma.upassFamilyTree.createMany({
      data: tree.map(sateiID => ({
        sateiID,
        sateiDate: satei.assessmentdatetime,
        rootSateiID: satei.sateiID,
      })),
    })
  }

  //途中から参加するメンバー

  const middleUpassDataList = await prisma.uPASS.findMany({
    where: {
      AND: [{dataSource: 'upass'}, {MyUpassTree: {is: null}}],
    },
  })

  for (let i = 0; i < middleUpassDataList.length; i++) {
    const satei = middleUpassDataList[i]

    const myPreviousAssessmentnumber = satei.previousAssessmentnumber

    const previousSateiFamilyTree = await prisma.upassFamilyTree.findFirst({
      where: {sateiID: myPreviousAssessmentnumber ?? ''},
    })
    const myRootSateiId = previousSateiFamilyTree?.rootSateiID

    if (myRootSateiId) {
      await prisma.upassFamilyTree.create({
        data: {
          sateiID: satei.sateiID,
          rootSateiID: myRootSateiId,
          sateiDate: satei.assessmentdatetime,
        },
      })
    }
  }

  return result
}
