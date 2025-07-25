import React, { useState } from "react";
import { Card, Typography, Box, Button, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';

const ModuleList = ({ modules }) => {
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  const toggleContent = (id) => {
    setExpandedModuleId((prevId) => (prevId === id ? null : id));
  };

  return (
    <Box>
      {modules.map((mod) => (
        <Card key={mod.id} sx={{ mb: 2, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography>{mod.name}</Typography>
            <Box display="flex" gap={1}>
              <IconButton onClick={() => toggleContent(mod.id)}>
                {expandedModuleId === mod.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton color="success">
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
          <Collapse in={expandedModuleId === mod.id && !!mod.content}>
            <Typography mt={2} color="text.secondary" variant="body2">
              {mod.content}
            </Typography>
          </Collapse>
        </Card>
      ))}
    </Box>
  );
};

export default ModuleList;
