import * as React from "react";
import { Request } from "../common/request";
import { Container } from "semantic-ui-react";
import logo from "../../static/logo.svg";

export interface WelcomeViewProps {
  request: Request;
}

export function WelcomeView({
  request
}: WelcomeViewProps): React.ReactElement<WelcomeViewProps> {
  const [versionString, setVersionString] = React.useState<string>("");
  React.useEffect(() => {
    Promise.resolve(request({ type: "GET-VERSION" })).then(setVersionString);
  }, [request]);
  return (
    <Container fluid>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5em"
        }}
      >
        <img src={logo} style={{ display: "block" }} />
        <h1>Welcome to Bookery!</h1>
        <p>Version {versionString}</p>
      </div>
    </Container>
  );
}
