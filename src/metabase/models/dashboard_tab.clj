(ns metabase.models.dashboard-tab
  (:require
   [metabase.models.interface :as mi]
   [metabase.models.serialization :as serdes]
   [metabase.util.date-2 :as u.date]
   [metabase.util.malli :as mu]
   [metabase.util.malli.schema :as ms]
   [methodical.core :as methodical]
   [toucan2.core :as t2]
   [toucan2.tools.hydrate :as t2.hydrate]))

(methodical/defmethod t2/table-name :model/DashboardTab [_model] :dashboard_tab)

(doto :model/DashboardTab
  (derive :metabase/model)
  (derive ::mi/read-policy.full-perms-for-perms-set)
  (derive ::mi/write-policy.full-perms-for-perms-set)
  (derive :hook/timestamped?)
  (derive :hook/entity-id))

(methodical/defmethod t2/model-for-automagic-hydration [:metabase.models.dashboard-card/DashboardCard :dashboard_tab]
  [_original-model _k]
  :model/DashboardTab)

(methodical/defmethod t2.hydrate/fk-keys-for-automagic-hydration [:metabase.models.dashboard-card/DashboardCard :dashboard_tab :default]
  [_original-model _dest-key _hydrating-model]
  [:dashboard_tab_id])

(defn- dashcard-comparator
  "Comparator that determines which of two dashcards comes first in the layout order used for pulses.
  This is the same order used on the frontend for the mobile layout. Orders cards left-to-right, then top-to-bottom"
  [dashcard-1 dashcard-2]
  (if-not (= (:row dashcard-1) (:row dashcard-2))
    (compare (:row dashcard-1) (:row dashcard-2))
    (compare (:col dashcard-1) (:col dashcard-2))))

(methodical/defmethod t2.hydrate/batched-hydrate [:default :ordered-tab-cards]
  "Given a list of tabs, return a seq of ordered tabs, in which each tabs contain a seq of orderd cards."
  [_model _k tabs]
  (assert (= 1 (count (set (map :dashboard_id tabs)))), "All tabs must belong to the same dashboard")
  (let [dashboard-id      (:dashboard_id (first tabs))
        tab-ids           (map :id tabs)
        dashcards         (t2/select :model/DashboardCard :dashboard_id dashboard-id :dashboard_tab_id [:in tab-ids])
        tab-id->dashcards (-> (group-by :dashboard_tab_id dashcards)
                              (update-vals #(sort dashcard-comparator %)))
        ordered-tabs      (sort-by :position tabs)]
    (for [{:keys [id] :as tab} ordered-tabs]
      (assoc tab :cards (get tab-id->dashcards id)))))

(defmethod mi/perms-objects-set :model/DashboardTab
  [dashtab read-or-write]
  (let [dashboard (or (:dashboard dashtab)
                      (t2/select-one :model/Dashboard :id (:dashboard_id dashtab)))]
    (mi/perms-objects-set dashboard read-or-write)))


;;; ----------------------------------------------- SERIALIZATION ----------------------------------------------------
(defmethod serdes/hash-fields :model/DashboardTab
  [_dashboard-tab]
  [:name
   (comp serdes/identity-hash
        #(t2/select-one :model/Dashboard :id %)
        :dashboard_id)
   :position
   :created_at])

;; DashboardTabs are not serialized as their own, separate entities. They are inlined onto their parent Dashboards.
(defmethod serdes/generate-path "DashboardTab" [_ dashcard]
  [(serdes/infer-self-path "Dashboard" (t2/select-one :model/Dashboard :id (:dashboard_id dashcard)))
   (serdes/infer-self-path "DashboardTab" dashcard)])

(defmethod serdes/load-xform "DashboardTab"
  [dashtab]
  (-> dashtab
      (dissoc :serdes/meta)
      (update :dashboard_id serdes/*import-fk* :model/Dashboard)
      (update :created_at   #(if (string? %) (u.date/parse %) %))))

;;; -------------------------------------------------- CRUD fns ------------------------------------------------------



(mu/defn update-tabs! :- nil?
  "Updates tabs of a dashboard if changed."
  [current-tabs :- [:sequential [:map [:id ms/PositiveInt]]]
   new-tabs     :- [:sequential [:map [:id ms/PositiveInt]]]]
  (let [update-ks       [:name :position]
        id->current-tab (group-by :id current-tabs)
        to-update-tabs  (filter
                          ;; filter out tabs that haven't changed
                          (fn [new-tab]
                            (let [current-tab (get id->current-tab (:id new-tab))]
                              (not= (select-keys current-tab update-ks)
                                    (select-keys new-tab update-ks))))

                          new-tabs)]
    (doseq [tab to-update-tabs]
      (t2/update! :model/DashboardTab (:id tab) (select-keys tab update-ks)))
    nil))

(mu/defn delete-tabs! :- nil?
  "Delete tabs of a Dashboard"
  [tab-ids :- [:sequential {:min 1} ms/PositiveInt]]
  (when (seq tab-ids)
    (t2/delete! :model/DashboardTab :id [:in tab-ids]))
  nil)
