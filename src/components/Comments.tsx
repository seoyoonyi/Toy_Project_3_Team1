import React, { useEffect, useState } from 'react'
import { getComment } from '@/api/comment/getComment'
import { addComment } from '@/api/comment/addComment'
import styled from '@emotion/styled'
import { colors } from '@/constants/color'
import { CommentType } from '@/types/commentType'
import formatDate from '@/utils/formatDate'

const Comments = () => {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<CommentType[]>([])
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
  const [page, setPage] = useState(1)
  const [warning, setWarning] = useState('')

  const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (comment.trim()) {
      await addComment(comment)
      setComment('')
      const updatedComments = await getComment(page)
      setComments(updatedComments)
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value
    if (newComment.length > 400) {
      setWarning('400자까지 입력할 수 있습니다.')
    } else {
      setWarning('')
      setComment(newComment)
    }
  }

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const newComments = await getComment(page)
        setComments((prevComments) => [...prevComments, ...newComments])
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }
    fetchComments()
  }, [page])

  return (
    <Container>
      <div>
        <form className="form" onSubmit={handleComment}>
          <textarea
            className="textarea"
            maxLength={400}
            onChange={handleCommentChange}
            value={comment}
          />
          <button className="button" type="submit">
            댓글
          </button>
        </form>
        {warning && <p className="warning">{warning}</p>}
      </div>

      <div className="comment-area">
        {comments.map((comment, index) => (
          <div key={index} className="comment-card">
            <img className="user-img" src={comment.userImg} alt="User Image" />
            <p className="user-name">{comment.userName} </p>
            <p className="comment-date">{formatDate(comment.createdAt)}</p>
            <div className="comment">
              {comment.comment.length > 250 && !expandedComments[comment.id] ? (
                <>
                  {comment.comment.slice(0, 250)} ···
                  <div className="show-more" onClick={() => toggleCommentExpansion(comment.id)}>
                    자세히 보기
                  </div>
                </>
              ) : (
                comment.comment
              )}
              {expandedComments[comment.id]}{' '}
            </div>
          </div>
        ))}
        <button className="more-button" onClick={() => setPage(page + 1)}>
          +
        </button>
      </div>
    </Container>
  )
}

export default Comments

const Container = styled.div`
  .form {
    display: flex;
    justify-content: center;
  }

  .warning {
    text-align: center;
    color: red;
    font-size: 0.8em;
  }

  .textarea {
    width: 80%;
    border: none;
    max-width: 80%;
    max-height: 100px;
    border-bottom: 1px solid;
    &:focus {
      outline: none;
    }
  }
  .button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 10px;
  }
  .comment-area {
    margin-top: 20px;
  }

  .comment-card {
    margin-bottom: 20px;
  }

  .user-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .user-name {
    font-weight: bold;
  }

  .comment-date {
    font-size: 0.8em;
    color: ${colors.darkGray};
  }

  .comment {
    word-break: break-all;
  }

  .show-more {
    color: ${colors.darkGray};
    cursor: pointer;
  }

  .more-button {
    cursor: pointer;
  }
`