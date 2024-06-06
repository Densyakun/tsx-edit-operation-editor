import treeState from "../lib/state";
import { TextField } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

interface IFormInputs {
  dirPath: string
};

export default function FilePathInput() {
  const { handleSubmit, control, reset } = useForm<IFormInputs>({
    defaultValues: {
      dirPath: treeState.dirPath,
    },
  })
  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    if (treeState.dirPath !== data.dirPath && data.dirPath)
      treeState.dirPath = data.dirPath;
  };

  return <form onSubmit={handleSubmit(onSubmit)}>
    <Controller
      name="dirPath"
      control={control}
      rules={{ required: true }}
      render={({ field }) => <TextField
        {...field}
        label="Directory path"
        variant="standard"
      />}
    />
  </form>;
}