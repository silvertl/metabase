import { DashboardSidebarName, DashboardState } from "metabase-types/store";

export const SIDEBAR_NAME: Record<DashboardSidebarName, DashboardSidebarName> =
  {
    addQuestion: "addQuestion",
    action: "action",
    clickBehavior: "clickBehavior",
    editParameter: "editParameter",
    sharing: "sharing",
    info: "info",
  };

export const INITIAL_DASHBOARD_STATE: DashboardState = {
  dashboardId: null,
  selectedTabId: null,
  isEditing: null,
  dashboards: {},
  dashcards: {},
  dashcardData: {},
  parameterValues: {},
  loadingDashCards: {
    dashcardIds: [],
    loadingIds: [],
    loadingStatus: "idle" as const,
    startTime: null,
  },
  loadingControls: {},
  isAddParameterPopoverOpen: false,
  slowCards: {},
  sidebar: { props: {} },
  missingActionParameters: null,
};
