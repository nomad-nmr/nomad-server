import { Button } from 'antd'
import { useNavigate } from 'react-router'
import moment from 'moment'
import { forwardRef, useEffect, useRef } from 'react'

const CommentItem = forwardRef(({ accessLevel, comment, onClose }, ref) => {
  const navigate = useNavigate()
  return (
    <Comment
    ref={ref}
      author={
        accessLevel === 'admin' ? (
          <Button
            type='link'
            onClick={() => {
              onClose()
              navigate(`/admin/users?username=${comment.user.username}`)
            }}
          >
            {comment.user.username}
          </Button>
        ) : (
          <span>{comment.user.username}</span>
        )
      }
      text={<p>{comment.text}</p>}
      time={moment(comment.createdAt).fromNow()}
    />
  )
})

const Comment = forwardRef(({ author, time, text }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{author}</div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{time}</div>
      <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{text}</div>
    </div>
  )
})

export default function CommentsList({ comments, accessLevel, onClose }) {
  const lastItemRef = useRef(null);
  useEffect(()=>{
    if (comments.length === 0 || !lastItemRef || !lastItemRef.current){
      return;
    }
    lastItemRef.current.scrollIntoView()

  }, [comments])
  return comments.map((comment, index) => (
    <CommentItem ref={index === comments.length - 1 ? lastItemRef : null} onClose={onClose} comment={comment} accessLevel={accessLevel} />
  ))
}
