import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {cl} from '@cm/lib/methods/common'

const FavButton = ({car, useGlobalProps, userId}) => {
  const {toggleLoad} = useGlobalProps as useGlobalPropType

  const {favoredByUserIds} = car

  const isFavored = favoredByUserIds.includes(userId)
  const toggleFav = async () => {
    toggleLoad(async () => {
      let newFavoredIds = [...favoredByUserIds]
      if (favoredByUserIds.includes(userId)) {
        newFavoredIds = favoredByUserIds.filter(id => id !== userId)
      } else {
        newFavoredIds = [...favoredByUserIds, userId]
      }
      await doStandardPrisma('car', 'update', {
        where: {id: car.id},
        data: {favoredByUserIds: newFavoredIds},
      })
    })
  }
  return (
    <button
      className={cl(`t-btn text text-sub-main  h-5 w-5 p-1  text-xs`, isFavored ? 'bg-yellow-500 opacity-100' : 'bg-sub-light  ')}
      onClick={toggleFav}
    >
      ★
    </button>
  )
}
export default FavButton
