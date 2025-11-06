import { Fab } from "@mui/material";
import { useState } from "react";
import EngineSettingsDialog from "./engineSettingsDialog";
import { Icon } from "@iconify/react";

export default function EngineSettingsButton() {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Fab
        title="Engine settings"
        size="medium"
        sx={{
          top: "auto",
          right: 16,
          bottom: 16,
          left: "auto",
          position: "fixed",
          width: 56,
          height: 56,
          backgroundColor: '#181A21',
          color: '#B48EFA',
          border: '1px solid rgba(180, 142, 250, 0.25)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
          transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: '#181A21',
            borderColor: '#B48EFA',
            boxShadow: '0 0 0 2px #B48EFA, 0 0 20px rgba(180, 142, 250, 0.3)',
            transform: 'scale(1.05)',
          },
        }}
        onClick={() => setOpenDialog(true)}
      >
        <Icon icon="mdi:settings" height={24} />
      </Fab>

      <EngineSettingsDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </>
  );
}
