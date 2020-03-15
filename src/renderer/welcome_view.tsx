import * as React from "react";
import { Request } from "../common/request";
import { Container } from "semantic-ui-react";

export interface WelcomeViewProps {
  request: Request;
}

export function WelcomeView({
  request
}: WelcomeViewProps): React.ReactElement<WelcomeViewProps> {
  const [versionString, setVersionString] = React.useState<string>("");
  Promise.resolve(request({ type: "GET-VERSION" })).then(setVersionString);
  return (
    <Container fluid>
      <p>Welcome!</p>
      <p>Version {versionString}</p>
    </Container>
  );
}
