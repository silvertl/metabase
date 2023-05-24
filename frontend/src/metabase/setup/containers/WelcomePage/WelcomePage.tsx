import { connect } from "react-redux";
import { State } from "metabase-types/store";
import WelcomePage from "../../components/WelcomePage";
import { loadWelcomeStep, submitWelcomeStep } from "../../actions";
import { isLocaleLoaded } from "../../selectors";

const mapStateToProps = (state: State) => ({
  isLocaleLoaded: isLocaleLoaded(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  onStepShow: () => {
    dispatch(loadWelcomeStep());
  },
  onStepSubmit: () => {
    dispatch(submitWelcomeStep());
  },
});

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
