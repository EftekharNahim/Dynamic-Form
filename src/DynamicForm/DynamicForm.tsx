import { useState, useEffect } from "react";
import { Form, Input, Button, Select, Radio, Checkbox } from "antd";
import type { FormData, Field } from "../../utilities/types";

interface DynamicFormProps {
  formData: FormData;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formData }) => {
  const [form] = Form.useForm();
  const [visibleFields, setVisibleFields] = useState<string[]>([]);

  const evaluateConditions = (field: Field, values: any) => {
    if (field.dependsOn) {
      const parentValue = values[field.dependsOn];

      // If parent field has no value, hide this field
      if (
        parentValue === undefined ||
        parentValue === null ||
        parentValue === "" ||
        (Array.isArray(parentValue) && parentValue.length === 0)
      ) {
        return false;
      }
    }

    if (!field.condition) return true;
    const fieldValue =
      values[field.condition.field.replace("{{", "").replace("}}", "")];
    const { operator, value } = field.condition;
    switch (operator) {
      case "===":
        return fieldValue === value;
      case "!==":
        return fieldValue !== value;
      case ">":
        return fieldValue > value;
      case "<":
        return fieldValue < value;
      case ">=":
        return fieldValue >= value;
      case "<=":
        return fieldValue <= value;
      case "includes":
        return Array.isArray(fieldValue) && fieldValue.includes(value);
      case "!includes":
        return Array.isArray(fieldValue) && !fieldValue.includes(value);
      default:
        return true;
    }
  };
  //Initialize Visible Fields on Load
  useEffect(() => {
    const initialVisible = formData.fields
      .filter((field) => evaluateConditions(field, {}))
      .map((f) => f.name);
    setVisibleFields(initialVisible);
  }, [formData]);

  const onValuesChange = (changedValues: any, allValues: any) => {
    const visible: string[] = formData.fields
      .filter((field) => evaluateConditions(field, allValues))
      .map((f) => f.name);
    setVisibleFields(visible);

    //Clear dependent fields if parent changes
    // formData.fields.forEach((f) => {
    //   if (f.dependsOn && changedValues[f.dependsOn]) {
    //     form.setFieldsValue({ [f.name]: undefined });
    //   }
    // });

    // Clear dependent child fields if parent value becomes null/empty
    formData.fields.forEach((f) => {
      if (f.dependsOn && changedValues.hasOwnProperty(f.dependsOn)) {
        const parentValue = allValues[f.dependsOn];

        // If parent is empty, null, undefined, or an empty array → clear child
        if (
          parentValue === undefined ||
          parentValue === null ||
          parentValue === "" ||
          (Array.isArray(parentValue) && parentValue.length === 0)
        ) {
          form.setFieldsValue({ [f.name]: undefined });
        } else {
          // Optional: if parent changed to a new value, and this child is now hidden
          // (because its condition is no longer true), clear it too.
          if (!visible.includes(f.name)) {
            form.setFieldsValue({ [f.name]: undefined });
          }
        }
      }
    });
  };

  const onFinish = (values: any) => {
    console.log("Form Submitted:", values);
  };

 // console.log(formData);
  return (
    <div>
      <Form
        form={form}
        name="basic"
        layout="vertical"
        className="space-y-4"
        style={{ maxWidth: 800 }}
        onValuesChange={onValuesChange}
        onFinish={onFinish}
       
      >
        {formData.fields.map((field: Field) => {
          if (!visibleFields.includes(field.name)) return null;
          switch (field.type) {
            case "text":
            case "email":
            case "password":
            case "number":
              return (
                <Form.Item
                  key={field.id}
                  label={field.label}
                  name={field.name}
                  initialValue={field.defaultValue}
                  rules={field.validations?.map((v) => ({
                    required: v.rule === "required",
                    min: v.rule === "minLength" ? Number(v.value) : undefined,
                    max: v.rule === "maxLength" ? Number(v.value) : undefined,
                    pattern:
                      v.rule === "pattern"
                        ? new RegExp(v.value as string)
                        : undefined,
                    type: v.rule === "email" ? "email" : undefined,
                    message: v.message,
                  }))}
                >
                  <Input type={field.type} placeholder={field.placeholder} />
                </Form.Item>
              );
            case "textarea":
              return (
                <Form.Item key={field.id} label={field.label} name={field.name}>
                  <Input.TextArea placeholder={field.placeholder} />
                </Form.Item>
              );
            case "select":
              return (
                <Form.Item
                  key={field.id}
                  label={field.label}
                  name={field.name}
                  rules={field.validations?.map((v) => ({
                    required: v.rule === "required",
                    message: v.message,
                  }))}
                >
                  <Select placeholder={field.placeholder} defaultValue={field.defaultValue}>
                    {field.options?.map((opt) => (
                      <Select.Option value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            case "radio":
              return (
                <Form.Item
                  key={field.id}
                  label={field.label}
                  name={field.name}
                  rules={field.validations?.map((v) => ({
                    required: v.rule === "required",
                    message: v.message,
                  }))}
                >
                  <Radio.Group defaultValue={field.defaultValue}>
                    {field.options?.map((opt) => (
                      <Radio value={opt.value}>{opt.label}</Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              );
            case "checkbox":
              return (
                <Form.Item
                  key={field.id}
                  name={field.name}
                  valuePropName="checked"
                  initialValue={field.defaultValue}
                >
                  <Checkbox>{field.label}</Checkbox>
                </Form.Item>
              );
          }
        })}
        <Form.Item className="flex justify-center">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DynamicForm;
