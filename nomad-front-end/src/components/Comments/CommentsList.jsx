import { Button } from 'antd'
import { useNavigate } from 'react-router'
import moment from 'moment'
export default function CommentsList({ comments, accessLevel, onClose }) {
  return comments.map(comment =>
    <CommentItem onClose={onClose} comment={comment} accessLevel={accessLevel} />
  )

}
const CommentItem = ({ accessLevel, comment, onClose }) => {
  console.log(moment(comment.createdAt).fromNow())
  const navigate = useNavigate()
  return <Comment
    author={accessLevel === 'admin' ? (
      <Button type='link' onClick={() => {
        onClose()
        navigate(`/admin/users?username=${comment.user.username}`)
      }
      }>
        {comment.user.username}
      </Button>
    ) : (
      <span>{comment.user.username}</span>
    )}

    text={<p>{comment.text}</p>}
    time={moment(comment.createdAt).fromNow()}
  />

}

const Comment = ({ author, time, text }) => {

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "0.75rem 1rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
        {author}
      </div>
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>
        {time}
      </div>
      <div style={{ fontSize: "14px", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
};