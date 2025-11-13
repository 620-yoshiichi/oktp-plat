export const Ths1 = ({colSpan, children}) => {
  return (
    <th style={{width: 60 * colSpan}} colSpan={colSpan + 1}>
      {children}
    </th>
  )
}
