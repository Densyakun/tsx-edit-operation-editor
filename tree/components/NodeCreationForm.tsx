import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { AddChildNodeType } from "../lib/type";

export default function NodeCreationForm({
  title,
  addChildNode,
}: {
  title: string,
  addChildNode: AddChildNodeType,
}) {
  const schema: yup.ObjectSchema<{ [x: string]: any }> =
    addChildNode.editorSchema
      ? yup.object(
        Object.fromEntries(Object.keys(addChildNode.editorSchema).map(key =>
          [key, addChildNode.editorSchema![key].schema]
        )) as yup.ObjectShape
      ).required()
      : yup.object();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
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
      addChildNode.func(data);
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
                if (addChildNode.editorSchema![key].selectItems)
                  return <FormControl sx={{ minWidth: 120 }} error={Boolean(errors[key])}>
                    <InputLabel id={`${key}-select-label`}>Age</InputLabel>
                    <Select
                      labelId={`${key}-select-label`}
                      label={addChildNode.editorSchema![key].label}
                      {...field}
                    >
                      {addChildNode.editorSchema![key].selectItems?./** ビルド時のエラー回避 */map((item) =>
                        <MenuItem key={item as string} value={item as string}>{item}</MenuItem>
                      )}
                    </Select>
                    <FormHelperText>{errors[key] && String(errors[key]?.message)}</FormHelperText>
                  </FormControl>;

                return <TextField
                  label={addChildNode.editorSchema![key].label}
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
                if (addChildNode.editorSchema![key].selectItems)
                  return <FormControl sx={{ minWidth: 120 }} error={Boolean(errors[key])}>
                    <InputLabel id={`${key}-select-label`}>Age</InputLabel>
                    <Select
                      labelId={`${key}-select-label`}
                      label={addChildNode.editorSchema![key].label}
                      {...field}
                    >
                      {addChildNode.editorSchema![key].selectItems?./** ビルド時のエラー回避 */map((item) =>
                        <MenuItem key={item[0]} value={item[1]}>{item[0]}</MenuItem>
                      )}
                    </Select>
                    <FormHelperText>{errors[key] && String(errors[key]?.message)}</FormHelperText>
                  </FormControl>;

                return <TextField
                  label={addChildNode.editorSchema![key].label}
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
                  label={addChildNode.editorSchema![key].label}
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
                  label={addChildNode.editorSchema![key].label}
                  type="number"
                  error={Boolean(errors[key])}
                  helperText={errors[key] && String(errors[key]?.message)}
                  {...field}
                />
              }
            />;

          return <Typography>{field.type}</Typography>;
        })}

        <Button type="submit" variant="contained" startIcon={<AddIcon />}>
          Add
        </Button>
      </Stack>
    </form>
  </Box>;
}