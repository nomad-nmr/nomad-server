import { connect } from "react-redux";
import { closeCommentsDrawer } from "../../store/actions/datasets";
import errorHandler from '../../store/actions/errorHandler'
import CommentsDrawer from "./CommentsDrawer";

const mapStateToProps = state => ({
  visible: state.datasets.commentsOpen,
  target: state.datasets.commentsTarget,
  token: state.auth.token,
  accessLevel: state.auth.accessLevel
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeCommentsDrawer()),
  errorHandler: (err) => dispatch(errorHandler(err))
})

export default connect(mapStateToProps, mapDispatchToProps)(CommentsDrawer);