import React, { useCallback } from "react";
import _ from "underscore";
import { t } from "ttag";

import { PLUGIN_CACHING } from "metabase/plugins";
import { useDispatch, useSelector } from "metabase/lib/redux";
import MetabaseSettings from "metabase/lib/settings";

import { Timeline } from "metabase/components/Timeline";
import EditableText from "metabase/core/components/EditableText";

import { Dashboard, Revision as RevisionType } from "metabase-types/api";
import { State } from "metabase-types/store";
import Revision from "metabase/entities/revisions";
import { getUser } from "metabase/selectors/user";

import { revertToRevision } from "metabase/dashboard/actions";

import Toggle from "metabase/core/components/Toggle";
import FormField from "metabase/core/components/FormField";
import { useUniqueId } from "metabase/hooks/use-unique-id";
import { getTimelineEvents } from "metabase/components/Timeline/utils";
import {
  DashboardInfoSidebarRoot,
  HistoryHeader,
  ContentSection,
  DescriptionHeader,
} from "./DashboardInfoSidebar.styled";

type DashboardAttributeType = string | number | null | boolean;

interface DashboardInfoSidebarProps {
  dashboard: Dashboard;
  setDashboardAttribute: (name: string, value: DashboardAttributeType) => void;
  saveDashboardAndCards: (preserveParameters?: boolean) => void;
  revisions: RevisionType[] | undefined;
}

export const DashboardInfoSidebar = _.compose(
  Revision.loadList({
    query: (state: State, props: DashboardInfoSidebarProps) => ({
      model_type: "dashboard",
      model_id: props.dashboard.id,
    }),
    wrapped: true,
    loadingAndErrorWrapper: false,
  }),
)(_DashboardInfoSidebar);

function _DashboardInfoSidebar({
  dashboard,
  setDashboardAttribute,
  saveDashboardAndCards,
  revisions,
}: DashboardInfoSidebarProps) {
  const currentUser = useSelector(getUser);
  const dispatch = useDispatch();

  const showCaching =
    PLUGIN_CACHING.isEnabled() && MetabaseSettings.get("enable-query-caching");

  const handleDescriptionChange = useCallback(
    (description: string) => {
      setDashboardAttribute("description", description);
      saveDashboardAndCards(true);
    },
    [saveDashboardAndCards, setDashboardAttribute],
  );

  const handleUpdateCacheTTL = useCallback(
    (cache_ttl: number | null) => {
      setDashboardAttribute("cache_ttl", cache_ttl);
      saveDashboardAndCards(true);
    },
    [saveDashboardAndCards, setDashboardAttribute],
  );

  const handleToggleAutoApplyFilters = useCallback(
    (isAutoApplyingFilters: boolean) => {
      setDashboardAttribute("auto_apply_filters", isAutoApplyingFilters);
      saveDashboardAndCards(true);
    },
    [saveDashboardAndCards, setDashboardAttribute],
  );

  const autoApplyFilterToggleId = useUniqueId();

  return (
    <DashboardInfoSidebarRoot data-testid="sidebar-right">
      <ContentSection>
        <DescriptionHeader>{t`About`}</DescriptionHeader>
        <EditableText
          initialValue={dashboard.description}
          isDisabled={!dashboard.can_write}
          onChange={handleDescriptionChange}
          isMultiline
          isMarkdown
          placeholder={t`Add description`}
          key={`dashboard-description-${dashboard.description}`}
        />
      </ContentSection>

      <ContentSection>
        <FormField
          title={t`Auto-apply filters`}
          orientation="horizontal"
          htmlFor={autoApplyFilterToggleId}
        >
          <Toggle
            id={autoApplyFilterToggleId}
            value={dashboard.auto_apply_filters}
            onChange={handleToggleAutoApplyFilters}
          />
        </FormField>
      </ContentSection>
      {showCaching && (
        <ContentSection>
          <PLUGIN_CACHING.DashboardCacheSection
            dashboard={dashboard}
            onSave={handleUpdateCacheTTL}
          />
        </ContentSection>
      )}

      <ContentSection>
        <HistoryHeader>{t`History`}</HistoryHeader>
        <Timeline
          events={getTimelineEvents({ revisions, currentUser })}
          data-testid="dashboard-history-list"
          revert={revision => dispatch(revertToRevision(revision))}
          canWrite={dashboard.can_write}
        />
      </ContentSection>
    </DashboardInfoSidebarRoot>
  );
}
