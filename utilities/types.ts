export type Validation= {
  rule: string;
  message: string;
  value?: string | number | boolean;
}

export type Condition= {
  field: string; // "{{fieldId}}"
  operator: "===" | "!==" | ">" | "<" | ">=" | "<=" | "includes" | "!includes";
  value: any;
}
export type Field ={
  id: string;
  type: "text" | "email" | "password" | "number" | "select" | "radio" | "checkbox" | "textarea";
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string | number | boolean }[];
  validations?: Validation[];
  condition?: Condition;
  dependsOn?: string;
}
export type FormData ={
  formId: string;
  title: string;
  fields: Field[];
}