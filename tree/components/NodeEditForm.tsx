import Form from '@rjsf/mui';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { Box, Snackbar } from "@mui/material";
import { NodeEditorUIType } from "../lib/type";
import { useState } from "react";

export default function NodeEditForm({
  editorui,
  isAdding = false,
}: {
  editorui: NodeEditorUIType,
  isAdding?: boolean,
}) {
  const [open, setOpen] = useState(false);

  const schema: RJSFSchema = editorui.editorSchema || { type: 'object' };

  return <Box
    sx={{
      width: "100%",
      height: "100%",
      p: 1,
    }}
  >
    <Form
      schema={schema}
      formData={editorui.getter && editorui.getter()}
      validator={validator}
      onSubmit={data => {
        editorui.setter(data.formData);
        setOpen(true);
      }}
    />
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
      }}
      message="Node changed"
    />
  </Box>;
}