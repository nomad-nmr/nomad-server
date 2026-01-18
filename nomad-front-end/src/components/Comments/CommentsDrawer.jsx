import { Drawer, Input, Empty, Typography, Form, Button } from "antd";
import axios from "../../axios-instance";
import { useEffect, useState } from "react";
import CommentsList from "./CommentsList";
export default function CommentsDrawer({
  open,
  onClose,
  accessLevel,
  data,
  loading,
  target,
  token,
  fetchComments,
}) {
  //todo: support persistent drafts ?

  useEffect(() => {
    if (!target || data[target] || !open) {
      return;
    }
    fetchComments(target, token);
  }, [target, open]);

  return (
    <Drawer
      width={600}
      title="Comments"
      placement="right"
      extra={
        <Button disabled={loading} onClick={() => fetchComments(target, token)}>
          Refresh
        </Button>
      }
      open={open}
      onClose={onClose}
      loading={loading}
      // footer={
      //   <CommentBox
      //     errorHandler={errorHandler}
      //     target={target}
      //     fetchComments={fetchComments}
      //     token={token}
      //   />
      // }
    >
      {(!data[target] || data[target].length === 0) && !loading ? (
        <>
          <Empty />
        </>
      ) : (
        <CommentsList
          onClose={onClose}
          accessLevel={accessLevel}
          comments={data[target]}
        />
      )}
    </Drawer>
  );
}

const CommentBox = ({ token, errorHandler, fetchComments, target }) => {
  const [form] = Form.useForm();
  const [uploadingComment, setUploadingComment] = useState(false);

  useEffect(() => {
    form.resetFields();
  }, [target]);

  const onSubmit = (comment) => {
    setUploadingComment(true);
    axios
      .put(
        "/datasets/comments/" + target,
        {
          text: comment,
        },
        {
          headers: { Authorization: "Bearer " + token },
        },
      )
      .then(async () => {
        await fetchComments(target);
        form.resetFields();
      })
      .catch((err) => errorHandler(err))
      .finally(() => setUploadingComment(false));
  };

  const handleFinish = ({ comment }) => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      style={{
        background: "#fff",
        padding: "1rem",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <Form.Item
        name="comment"
        rules={[
          { required: true, message: "Please enter your comment!" },
          { max: 1000, message: "Comment cannot exceed 1000 characters!" },
        ]}
        style={{ marginBottom: "0.5rem" }}
      >
        <Input
          disabled={uploadingComment}
          placeholder="Write a comment..."
          maxLength={1000}
        />
      </Form.Item>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Form.Item noStyle shouldUpdate>
          {() => (
            <Button
              type="primary"
              htmlType="submit"
              loading={uploadingComment}
              disabled={
                !form.getFieldValue("comment") ||
                !form.getFieldValue("comment").trim() ||
                uploadingComment
              }
            >
              Post
            </Button>
          )}
        </Form.Item>
      </div>
    </Form>
  );
};
