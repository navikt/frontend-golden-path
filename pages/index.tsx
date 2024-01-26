import "@navikt/ds-css";
import { Button, Heading, Popover } from "@navikt/ds-react";
import { GetServerSideProps } from "next";
import { useRef, useState } from "react";
import { makeSession } from "@navikt/dp-auth";
import { idporten } from "@navikt/dp-auth/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/dp-auth/obo-providers";
import { withPrometheus } from "@navikt/dp-auth/obo-providers/withPrometheus";
import { Counter, Histogram } from "prom-client";

const Home = ({ apiResponse }: { apiResponse: string }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openState, setOpenState] = useState(false);

  return (
    <>
      <Heading size="xlarge">{apiResponse}</Heading>

      <Button
        ref={buttonRef}
        onClick={() => setOpenState(!openState)}
        aria-expanded={openState}
      >
        Ikke klikk her!!!
      </Button>

      <Popover
        open={openState}
        onClose={() => setOpenState(false)}
        anchorEl={buttonRef.current}
      >
        <Popover.Content>Du klarte ikke å la være, altså...</Popover.Content>
      </Popover>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const histogram = new Histogram({
    name: "frontend-golden-path-index-getServerSideProps",
    help: "Duration of getServerSideProps in seconds",
  }).startTimer();
  const bearerToken = context.req.headers.authorization;
  if (!bearerToken) {
    return {
      props: {
        foo: "Authorization header not found",
      },
    };
  }

  const getSession = makeSession({
    identityProvider: idporten,
    oboProvider: withInMemoryCache(withPrometheus(tokenX)),
  });

  const session = await getSession(context.req);

  try {
    const oboToken = await session.apiToken(
      `dev-gcp:frontend-golden-path:frontend-golden-path-api`
    );
    const apiResponse = await lookupStuffInAPI(oboToken);
    return {
      props: {
        apiResponse: apiResponse,
      },
    };
  } catch (e) {
    return {
      props: {
        apiResponse: `Error while exchanging token`,
      },
    };
  } finally {
    histogram();
  }
};

const lookupStuffInAPI = async (authToken: string) => {
  try {
    const apiResult = await fetch("http://frontend-golden-path-api", {
      headers: {
        Authorization: authToken,
      },
    });
    return await apiResult.text();
  } catch (error) {
    return `oh noes, that didn't go so well: ${error}`;
  }
};

export default Home;
