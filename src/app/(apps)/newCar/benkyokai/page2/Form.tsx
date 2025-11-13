import React from 'react'

export default function Form(props) {
  const {formState, change, number} = props
  return (
    <div>
      <form className={`mx-auto w-[300px] p-2`}>
        <div className={` flex flex-col items-start gap-5`}>
          <div>
            <label className={`inline-block w-[100px]`} htmlFor="name">
              名前
            </label>
            <input
              id="name"
              onChange={e => {
                if (number > 5) {
                  change({
                    name: e.target.value,
                  })
                }
              }}
              value={formState?.name}
              className={`border`}
            />
          </div>

          {!formState.name && <div className={`text-red-500`}>名前を入力してください</div>}
          {/* <div>
       <label className={`inline-block w-[100px]`} htmlFor="email">
         メアド
       </label>
       <input id="email" className={`border`} />
     </div>
     <div>
       <label className={`inline-block w-[100px]`} htmlFor="pw">
         パスワード
       </label>
       <input id="pw" className={`border`} />
     </div> */}
        </div>
      </form>
    </div>
  )
}
