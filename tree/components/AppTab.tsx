import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import FilePathInput from "./FilePathInput";
import ProjectNodeEditor from "./ProjectNodeEditor";
import Addons from "./Addons";

export default function AppTab() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return <>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Project editor" value={0} />
        <Tab label="Addons" value={1} />
      </Tabs>
    </Box>
    {
      value === 0
        ? <>
          <FilePathInput />
          <ProjectNodeEditor />
        </>
        : <Addons />
    }
  </>;
}