import ScheduleBoard from './ScheduleBoard'

/** 後方互換ラッパー: mode='cr' のScheduleBoard */
const NewScheduleBoard = (props: any) => <ScheduleBoard {...props} mode="cr" />

export default NewScheduleBoard
