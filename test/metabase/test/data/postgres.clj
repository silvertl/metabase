(ns metabase.test.data.postgres
  "Postgres driver test extensions."
  (:require
   [metabase.test.data.interface :as tx]
   [metabase.test.data.sql-jdbc :as sql-jdbc.tx]))

(set! *warn-on-reflection* true)

(sql-jdbc.tx/add-test-extensions! :postgres)

(defmethod tx/has-questionable-timezone-support? :postgres [_] true) ; TODO - What?

(defmethod tx/sorts-nil-first? :postgres [_ _] false)

(defmethod tx/aggregate-column-info :postgres
  ([driver ag-type]
   ((get-method tx/aggregate-column-info ::tx/test-extensions) driver ag-type))

  ([driver ag-type field]
   (merge
    ((get-method tx/aggregate-column-info ::tx/test-extensions) driver ag-type field)
    (when (= ag-type :sum)
      {:base_type :type/BigInteger}))))

(defmethod tx/dbdef->connection-details :postgres
  [_driver context {:keys [database-name]}]
  (merge
   {:host     (tx/db-test-env-var-or-throw :postgresql :host "localhost")
    :port     (tx/db-test-env-var-or-throw :postgresql :port 5432)
    :timezone :America/Los_Angeles}
   (when-let [user (tx/db-test-env-var :postgresql :user)]
     {:user user})
   (when-let [password (tx/db-test-env-var :postgresql :password)]
     {:password password})
   (when (= context :db)
     {:db database-name})))
