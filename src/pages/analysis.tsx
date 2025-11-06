"use client";
import dynamic from "next/dynamic";
import PanelHeader from "@/sections/analysis/panelHeader";
import PanelToolBar from "@/sections/analysis/panelToolbar";
import AnalysisTab from "@/sections/analysis/panelBody/analysisTab";
import ClassificationTab from "@/sections/analysis/panelBody/classificationTab";
import { boardAtom, gameAtom, gameEvalAtom } from "@/sections/analysis/states";
import {
  Box,
  Divider,
  Grid2 as Grid,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAtomValue } from "jotai";
import React from "react";
import { Icon } from "@iconify/react";
import EngineSettingsButton from "@/sections/engineSettings/engineSettingsButton";
import GraphTab from "@/sections/analysis/panelBody/graphTab";
import { PageTitle } from "@/components/pageTitle";

const BoardContainer = dynamic(
  () => import("@/sections/analysis/board"),
  { ssr: false }
);

export default function GameAnalysis() {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const isLgOrGreater = useMediaQuery(theme.breakpoints.up("lg"));

  const gameEval = useAtomValue(gameEvalAtom);
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);
  const showMovesTab = game.history().length > 0 || board.history().length > 0;

  React.useEffect(() => {
    if (tab === 1 && !showMovesTab) setTab(0);
    if (tab === 2 && !gameEval) setTab(0);
  }, [showMovesTab, gameEval, tab]);

  return (
    <Grid
      container
      gap={4}
      justifyContent="center"
      alignItems="start"
      sx={{
        minHeight: "calc(100vh - 120px)",
        padding: { xs: 2, md: 4 },
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <PageTitle title="Chesspoint.io - Analysis" />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          width: '100%',
          alignItems: { xs: 'center', lg: 'stretch' },
          justifyContent: 'stretch',
        }}
      >
        <Box
          id="board-column"
          sx={{
            flex: { xs: '1 1 100%', lg: '1 1 50%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: { xs: 'center', lg: 'flex-start' },
            minWidth: 0,
            maxWidth: { xs: '100%', lg: '50%' },
          }}
        >
          <BoardContainer />
        </Box>

        <Box
          id="analysis-panel"
          sx={{
            flex: { xs: "1 1 100%", lg: "1 1 50%" },
            width: { xs: "100%", lg: "50%" },
            maxWidth: { xs: "100%", lg: "50%" },
            display: "flex",
            flexDirection: "column",
            height: {
              xs: tab === 1 ? "40rem" : "auto",
              lg: "calc(100vh - 180px)"
            },
            maxHeight: { lg: "900px" },
            backgroundColor: "rgba(123, 90, 240, 0.05)",
            border: "1px solid rgba(123, 90, 240, 0.2)",
            borderRadius: 3,
            padding: 3,
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 20px rgba(123, 90, 240, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Player info */}
          <Box width="100%" sx={{ flexShrink: 0 }}>
            <PanelHeader />
          </Box>

          {/* Graph - always visible */}
          {gameEval && (
            <Box width="100%" sx={{ flexShrink: 0, mt: 2 }}>
              <GraphTab />
            </Box>
          )}

          {/* Tabs: Analysis and Moves only */}
          <Box
            width="100%"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
              mt: 2,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, newValue) => setTab(newValue)}
              aria-label="analysis tabs"
              variant="fullWidth"
              sx={{ minHeight: 0 }}
            >
              <Tab
                label="Analysis"
                id="tab0"
                icon={<Icon icon="mdi:magnify" height={16} />}
                iconPosition="start"
                sx={{
                  textTransform: "none",
                  minHeight: 40,
                  fontSize: "0.9rem",
                }}
                disableFocusRipple
              />

              <Tab
                label="Moves"
                id="tab1"
                icon={<Icon icon="mdi:format-list-bulleted" height={16} />}
                iconPosition="start"
                sx={{
                  textTransform: "none",
                  minHeight: 40,
                  fontSize: "0.9rem",
                  display: showMovesTab ? undefined : "none",
                }}
                disableFocusRipple
              />
            </Tabs>
          </Box>

          {/* Scrollable content area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              width: "100%",
              minHeight: 0,
              mt: 2,
            }}
          >
            <AnalysisTab
              role="tabpanel"
              hidden={tab !== 0}
              id="tabContent0"
            />

            <ClassificationTab
              role="tabpanel"
              hidden={tab !== 1}
              id="tabContent1"
            />
          </Box>

          {/* Toolbar at bottom */}
          <Box width="100%" sx={{ flexShrink: 0, mt: 2, pt: 2, borderTop: '1px solid rgba(123, 90, 240, 0.2)' }}>
            <PanelToolBar />
          </Box>
        </Box>
      </Box>

      <EngineSettingsButton />
    </Grid>
  );
}
