import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import {
  restore,
  visitDashboard,
  cartesianChartCircle,
  echartsContainer,
} from "e2e/support/helpers";

const { ORDERS, ORDERS_ID, PRODUCTS } = SAMPLE_DATABASE;

describe("issue 27380", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();
  });

  it("should not drop fields from joined table on dashboard 'zoom-in' (metabase#27380)", () => {
    const questionDetails = {
      query: {
        "source-table": ORDERS_ID,
        aggregation: [["count"]],
        breakout: [
          [
            "field",
            PRODUCTS.CREATED_AT,
            { "source-field": ORDERS.PRODUCT_ID, "temporal-unit": "month" },
          ],
        ],
      },
      display: "line",
    };
    cy.createQuestionAndDashboard({ questionDetails }).then(
      ({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      },
    );

    // Doesn't really matter which 'circle" we click on the graph
    cartesianChartCircle().last().click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("See this month by week").click();
    cy.wait("@dataset");

    // Graph should still exist
    // Checks the y-axis label
    echartsContainer().findByText("Count");

    cy.icon("notebook").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Pick a column to group by").should("not.exist");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Product → Created At: Week");
  });
});
