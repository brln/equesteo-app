export default logger = store => dispatch => action => {
  console.log(action.type)
  dispatch(action)
}