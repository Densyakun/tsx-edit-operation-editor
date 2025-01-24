import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, MenuItem, Select, Snackbar, SnackbarCloseReason, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { NodeEditorUIType } from "../lib/type";
import { useState } from "react";

export default function NodeEditForm({
  title = "",
  editorui,
  isAdding = false,
}: {
  title?: string,
  editorui: NodeEditorUIType,
  isAdding?: boolean,
}) {
  const schema: yup.ObjectSchema<{ [x: string]: any }> =
    editorui.editorSchema
      ? yup.object(
        Object.fromEntries(Object.keys(editorui.editorSchema).map(key =>
          [key, editorui.editorSchema![key].schema]
        )) as yup.ObjectShape
      ).required()
      : yup.object();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: editorui.getter && editorui.getter(),
    resolver: yupResolver(schema),
  });

  return <Box
    sx={{
      width: "100%",
      height: "100%",
      p: 1,
    }}
  >
    <form onSubmit={handleSubmit(data => {
      editorui.setter(data);
    })}>
      <FormLabel component="legend">{title}</FormLabel>
      <Stack spacing={1}>
        {Object.keys(schema.fields).map(key => {
          const field = schema.fields[key] as yup.Schema;

          // TODO mixed, date, array, tuple, object

          if (field.type === "string")
            return <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => {
                if (editorui.editorSchema![key].selectItems)
                  return <FormControl sx={{ minWidth: 120 }} error={Boolean(errors[key])}>
                    <InputLabel id={`${key}-select-label`}>Age</InputLabel>
                    <Select
                      labelId={`${key}-select-label`}
                      label={editorui.editorSchema![key].label}
                      {...field}
                    >
                      {editorui.editorSchema![key].selectItems?./** ビルド時のエラー回避 */map((item) =>
                        <MenuItem key={item as string} value={item as string}>{item}</MenuItem>
                      )}
                    </Select>
                    <FormHelperText>{errors[key] && String(errors[key]?.message)}</FormHelperText>
                  </FormControl>;

                return <TextField
                  label={editorui.editorSchema![key].label}
                  error={Boolean(errors[key])}
                  helperText={errors[key] && String(errors[key]?.message)}
                  {...field}
                />;
              }}
            />;

          if (field.type === "number")
            return <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => {
                if (editorui.editorSchema![key].selectItems)
                  return <FormControl sx={{ minWidth: 120 }} error={Boolean(errors[key])}>
                    <InputLabel id={`${key}-select-label`}>Age</InputLabel>
                    <Select
                      labelId={`${key}-select-label`}
                      label={editorui.editorSchema![key].label}
                      {...field}
                    >
                      {editorui.editorSchema![key].selectItems?./** ビルド時のエラー回避 */map((item) =>
                        <MenuItem key={item[0]} value={item[1]}>{item[0]}</MenuItem>
                      )}
                    </Select>
                    <FormHelperText>{errors[key] && String(errors[key]?.message)}</FormHelperText>
                  </FormControl>;

                return <TextField
                  label={editorui.editorSchema![key].label}
                  type="number"
                  error={Boolean(errors[key])}
                  helperText={errors[key] && String(errors[key]?.message)}
                  {...field}
                />;
              }}
            />;

          if (field.type === "boolean")
            return <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) =>
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label={editorui.editorSchema![key].label}
                />
              }
            />;

          if (field.type === "date")
            return <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) =>
                <TextField
                  label={editorui.editorSchema![key].label}
                  type="number"
                  error={Boolean(errors[key])}
                  helperText={errors[key] && String(errors[key]?.message)}
                  {...field}
                />
              }
            />;

          return <Typography>{field.type}</Typography>;
        })}

        <SubmitButton isAdding={isAdding} />
      </Stack>
    </form>
  </Box>;
}

function SubmitButton({ isAdding }: { isAdding: boolean }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return <>
    <Button type="submit" variant="contained" startIcon={isAdding && <AddIcon />} onClick={handleClick}>
      {isAdding ? "Add" : "Change"}
    </Button>
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={handleClose}
      message="Node changed"
    />
  </>;
}