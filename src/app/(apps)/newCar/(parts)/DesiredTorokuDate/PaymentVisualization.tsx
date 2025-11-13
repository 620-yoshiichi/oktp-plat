import {NumHandler} from '@cm/class/NumHandler'
import {Alert, TextOrange, TextBlue, TextRed} from '@cm/components/styles/common-components/Alert'
import {Absolute, Center, C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import React, {Fragment} from 'react'

const PaymentVisualization = ({newCar}) => {
  const {
    NO_CYUMON,
    KJ_KAINMEI1,
    KJ_KURUMAME,
    KJ_MEIGIME1,
    KI_BETSIHAK,
    KI_SHRIGK,
    KI_NYURUIKE,
    KI_SITADORI,
    KI_SITZAN,
    KI_SITANYKG,
  } = newCar

  // 必要な数値を計算
  const NYUKIN = KI_NYURUIKE - KI_SITANYKG
  // const SHITADORI = KI_SITANYKG - KI_SITZAN

  const GOAL = KI_SHRIGK
  const GOAL_SHITADORI = KI_SITADORI - KI_SITZAN

  const GOAL_GENKIN = KI_SHRIGK - GOAL_SHITADORI
  const SOUGAKU = KI_SHRIGK - GOAL_SHITADORI + KI_SITANYKG

  const FULLFILLED_CRITERIA =
    newCar.CUSTOM_paymentCheckCustomerType === `直販個人`
      ? GOAL_GENKIN
      : newCar.CUSTOM_paymentCheckCustomerType === `業販/法人`
        ? KI_BETSIHAK
        : 0

  const FullFilled = FULLFILLED_CRITERIA <= KI_NYURUIKE

  // 長方形の割合を計算（高さのパーセンテージとして使用）
  const totalHeight = 260 // px,
  const totalWidth = 600

  const firstCols = 0
  const secondCols = totalWidth * (1 / 4)
  const thirdCols = totalWidth * (2 / 4)

  const KI_BETSIHAK_Height = (KI_BETSIHAK / SOUGAKU) * totalHeight

  const setMinimumHeight = (height, valueIfExist) => {
    const minimumHeight = 30
    if (valueIfExist) {
      return Math.max(height, minimumHeight)
    } else {
      return height
    }
  }
  const setMaximumHeight = (height, valueIfExist) => {
    const minimumHeight = 0
    if (GOAL_SHITADORI) {
      return Math.max(height, minimumHeight)
    } else {
      return height
    }
  }

  const borderStyle = `1.5px solid gray`
  const GOAL_BOX = () => {
    return (
      <div
        style={{
          height: totalHeight,
          width: `25%`,
          backgroundColor: '#e2e2e2',
          position: 'absolute',
          bottom: 0,
          zIndex: 10,
          left: firstCols,
          border: borderStyle,
        }}
      ></div>
    )
  }

  const GOAL_GENKIN_BOX = () => {
    const height = (GOAL_GENKIN / GOAL) * totalHeight

    return (
      <div
        style={{
          height: height,
          width: `25%`,
          backgroundColor: '#4f96f9',
          position: 'absolute',
          bottom: 0,
          zIndex: 10,
          left: firstCols,
          border: GOAL_GENKIN && borderStyle,
        }}
      >
        <Center className={`text-base text-black`}>
          <C_Stack className={` items-center gap-1`}>
            <div>現金総額（諸費用込）</div>
            <div>{NumHandler.toPrice(GOAL_GENKIN)}円</div>
          </C_Stack>
        </Center>
      </div>
    )
  }

  const GOAL_SHITADORI_BOX = () => {
    return (
      <div
        style={{
          height: setMaximumHeight((GOAL_SHITADORI / GOAL) * totalHeight, GOAL_SHITADORI),
          width: `25%`,
          backgroundColor: '#fa6767',
          position: 'absolute',
          zIndex: 10,
          left: firstCols,
          bottom: (GOAL_GENKIN / GOAL) * totalHeight,
          border: GOAL_SHITADORI && borderStyle,
        }}
      >
        {GOAL_SHITADORI && (
          <Absolute className={`!-top-[15px] z-[9999] w-full`}>
            <div className={` text-error-main text-base font-bold `}>下取:{NumHandler.toPrice(GOAL_SHITADORI)}円</div>
          </Absolute>
        )}
      </div>
    )
  }

  const SyohiyoBox = () => {
    return (
      <div>
        <div
          style={{
            height: setMinimumHeight((KI_BETSIHAK_Height / GOAL) * totalHeight, KI_BETSIHAK_Height),
            width: `23%`,
            margin: `auto`,
            backgroundColor: '#faba70',
            borderColor: `#faba70`,
            position: 'absolute',
            bottom: 0,
            zIndex: 40,
            left: firstCols,
            border: KI_BETSIHAK_Height && borderStyle,
          }}
        >
          {KI_BETSIHAK && (
            <Absolute className={` z-[9999] w-full`}>
              <div className={` text-base text-sm text-black`}>うち諸費用:{NumHandler.toPrice(KI_BETSIHAK)}円</div>
            </Absolute>
          )}
        </div>
      </div>
    )
  }

  const NyukinBox = () => {
    const height = (NYUKIN / GOAL) * totalHeight + (NYUKIN && !FullFilled ? -10 : 0)

    return (
      <div>
        <div
          style={{
            height: setMinimumHeight(height, NYUKIN),
            width: `25%`,
            left: thirdCols,
            backgroundColor: '#fff0ad',
            position: 'absolute',
            bottom: 0,
            zIndex: 20,
            border: KI_NYURUIKE && borderStyle,
          }}
        >
          <Center className={`text-base text-black`}>
            <C_Stack>
              <div>入金累計:{NumHandler.toPrice(NYUKIN)}円</div>
              {/* {KI_NYURUIKE > 0 && (
                <C_Stack className={`gap-0 text-sm`}>
                  <div>入金: {NumHandler.toPrice(KI_NYURUIKE - KI_SITANYKG)}円</div>
                  <div>下取: {NumHandler.toPrice(SHITADORI)}</div>
                </C_Stack>
              )} */}
            </C_Stack>
          </Center>
        </div>
      </div>
    )
  }

  const Border = ({left}) => {
    const height = (FULLFILLED_CRITERIA / KI_SHRIGK) * totalHeight

    return (
      <div
        style={{
          // height: height,
          height: setMinimumHeight(height, FULLFILLED_CRITERIA),
          width: `25%`,
          position: 'absolute',
          bottom: 0,
          zIndex: 100,
          left,
          borderTop: `2px dashed gray`,
        }}
      ></div>
    )
  }
  return (
    <C_Stack>
      <section>
        <R_Stack className={` items-start justify-between`}>
          <C_Stack>
            <div>注文番号: {NO_CYUMON}</div>
            <div>会員名: {KJ_KAINMEI1}</div>
            <div>車名: {KJ_KURUMAME}</div>
            <div>名義: {KJ_MEIGIME1}</div>
            <strong>総額: {NumHandler.toPrice(GOAL)}円</strong>
          </C_Stack>
          <C_Stack>
            <Alert color={`blue`}>
              <div>
                直販個人: <TextBlue>現金総額</TextBlue>の入金が必要
              </div>
              <div>
                業販/法人: <TextOrange>諸費用分</TextOrange>の入金が必要
              </div>
            </Alert>
            <Alert color={`red`}>
              <TextRed>注意事項</TextRed>
              <div>
                ①ai21の<TextRed>入金データをもとに、1日に一回更新</TextRed>されます。
                <br />
                ②現金総額は注文書の内容を反映しています。
                <br />
                そのため、
                <TextRed>実際の登録月と注文書での登録月が異なる場合</TextRed>、
                <br />
                差額が発生し、<TextRed>「未」</TextRed>
                となっている場合があります。
              </div>
              <div>
                ③<TextRed>リース契約</TextRed>に関しては、入金がないため、<TextRed>「未」</TextRed>と表示されます。
              </div>
            </Alert>
          </C_Stack>
        </R_Stack>
      </section>

      <section className={` !mt-[80px]`}>
        <R_Stack className={`  flex-nowrap `}>
          <section>
            <div>
              <div
                style={{
                  position: 'relative',
                  height: totalHeight,
                  width: totalWidth,
                  borderCollapse: `collapse`,
                  zIndex: 500,
                }}
              >
                <Fragment>
                  <GOAL_BOX />
                  <SyohiyoBox />
                  <GOAL_SHITADORI_BOX />
                  <GOAL_GENKIN_BOX />
                </Fragment>
                <Border {...{left: firstCols}} />
                <Border {...{left: secondCols}} />
                <Border {...{left: thirdCols}} />

                <NyukinBox />
              </div>
            </div>
          </section>
        </R_Stack>
      </section>
    </C_Stack>
  )
}

export default PaymentVisualization
