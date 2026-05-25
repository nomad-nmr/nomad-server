import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Form, Button, Space, Input, Modal, Spin, Radio} from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import { fetchAnnouncement, saveAnnouncement, clearAnnouncement } from '../../store/actions'

import classes from './Announcement.module.css'

const Announcement = props => {

  const [form] = Form.useForm()
  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    window.scrollTo(0, 0)
    props.fetchAnnouncement(props.authToken)
  }, [props.fetchAnnouncement, props.authToken])

  useEffect(() => {
    if (props.announcement) {
      form.setFieldsValue({
        title: props.announcement.title,
        body: props.announcement.body,
        kind: props.announcement.kind || 'info'
      })

    }
  }, [props.announcement, form])

  const onFinish = values => {
    props.saveAnnouncement(props.authToken, values)
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  }




  const onDelete = () => {
    modal.confirm({
      title: 'Delete Announcement',
      content: 'Are you sure you want to delete the current announcement?',
      onOk() {
        props.clearAnnouncement(props.authToken)
        form.resetFields()
      }
    })
  }

  return (
    <Spin spinning={props.loading} tip='Processing ...' size='large'>
      {contextHolder}
      <Form
        form={form}
        className={classes.Centered}
        onFinish={onFinish}
        style={{ marginTop: 35 }}
      >
        <Form.Item name='title'>
          <Input placeholder='Title (Optional)' maxLength={200} />
        </Form.Item>

        <Form.Item name='kind' initialValue='info' label='Announcement Type'>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='info'>Info</Radio.Button>
            <Radio.Button value='warning'>Warning</Radio.Button>
            <Radio.Button value='news'>News</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
        name='body'
        rules={[
          {
            validator: (_, value) => {
              const stripped = value?.replace(/<(.|\n)*?>/g, '').trim()
              if (!stripped) {
                return Promise.reject(new Error('Announcement body is empty'))
              }
              return Promise.resolve()
            }
          }
        ]}
      >
        <ReactQuill theme='snow' modules={quillModules} />
      </Form.Item>


        <Form.Item>
          <Space style={{ marginTop: 10 }}>
            <Button type='primary' htmlType='submit'>
              Publish Announcement
            </Button>
            <Button danger onClick={onDelete}>
              Delete Announcement
            </Button>
            <Button
              onClick={() => {
                form.resetFields()
              }}
            >
              Clear Text
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Spin>
  )
}



const mapStateToProps = state => {
  return {
    authToken: state.auth.token,
    announcement: state.announcement.announcement,
    loading: state.announcement.loading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchAnnouncement: token => dispatch(fetchAnnouncement(token)),
    saveAnnouncement: (token, data) => dispatch(saveAnnouncement(token, data)),
    clearAnnouncement: token => dispatch(clearAnnouncement(token))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Announcement)
