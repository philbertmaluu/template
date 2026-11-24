import { Alert, Button, Drawer, Form } from 'antd'
import type { FormInstance } from 'antd'
import axios from 'axios'
import { useState, type ReactNode } from 'react'
import { getErrorMessage } from '../lib/api'

type FormDrawerProps<T extends object> = {
  open: boolean
  title: string
  onClose: () => void
  /** Called with the validated form values. Throw to keep the drawer open. */
  onSubmit: (values: T) => Promise<void> | void
  submitText?: string
  children: ReactNode
}

/**
 * Standard drawer for every form in this app.
 * Put antd `<Form.Item>` fields in `children`. Laravel validation errors are shown on the matching fields.
 */
export function FormDrawer<T extends object>({
  open,
  title,
  onClose,
  onSubmit,
  submitText = 'Save',
  children,
}: FormDrawerProps<T>) {
  const [form] = Form.useForm<T>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    form.resetFields()
    setError(null)
    onClose()
  }

  const handleFinish = async (values: T) => {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      form.resetFields()
      onClose()
    } catch (err) {
      applyServerErrors(form, err)
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      title={title}
      open={open}
      size={420}
      destroyOnHidden
      onClose={close}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            {submitText}
          </Button>
        </div>
      }
    >
      {error && <Alert type="error" title={error} showIcon className="mb-4" />}
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark>
        {children}
      </Form>
    </Drawer>
  )
}

function applyServerErrors<T extends object>(form: FormInstance<T>, error: unknown) {
  if (!axios.isAxiosError(error)) return
  const errors = (error.response?.data as { errors?: Record<string, string[]> } | undefined)?.errors
  if (!errors) return

  form.setFields(
    Object.entries(errors).map(([name, messages]) => ({
      name,
      errors: messages,
    })) as Parameters<FormInstance<T>['setFields']>[0],
  )
}
