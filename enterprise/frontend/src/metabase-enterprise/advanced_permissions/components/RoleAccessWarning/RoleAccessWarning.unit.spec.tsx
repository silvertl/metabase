import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "react-router";
import { createMockDatabase } from "metabase-types/api/mocks";
import { Database } from "metabase-types/api";
import { renderWithProviders } from "__support__/ui";
import RoleAccessWarning from "./RoleAccessWarning";

const setup = (database: Database) => {
  renderWithProviders(
    <Route
      path="*"
      component={() => <RoleAccessWarning database={database} />}
    />,
    {
      withRouter: true,
    },
  );
};

describe("RoleAccessWarning", () => {
  it("should render correctly for databases without a user", () => {
    setup(createMockDatabase());
    expect(
      screen.getByText(
        "Make sure the main database credential has access to everything different user groups may need access to. It's what Metabase uses to sync table information.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/edit settings/i)).toHaveAttribute(
      "href",
      "/admin/databases/1",
    );
  });

  it("should render correct message for databases with a user", () => {
    setup(
      createMockDatabase({
        name: "My Database",
        details: {
          user: "metabase_user",
        },
      }),
    );

    expect(
      screen.getByText(
        "metabase_user is the database user Metabase is using to connect to My Database. Make sure that metabase_user has access to everything in My Database that all Metabase groups may need access to, as that database user account is what Metabase uses to sync table information.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/edit settings/i)).toHaveAttribute(
      "href",
      "/admin/databases/1#user",
    );
  });
});
