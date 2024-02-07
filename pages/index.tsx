import { getSession } from "@navikt/oasis";
import "@navikt/ds-css";
import { Button, Heading, Popover } from "@navikt/ds-react";
import { GetServerSideProps } from "next";
import { Histogram } from "prom-client";
import { useRef, useState } from "react";

const audience = `${process.env.NAIS_CLUSTER_NAME}:${process.env.NAIS_NAMESPACE}:frontend-golden-path-api`;

const histogram = new Histogram({
  name: "frontend_golden_path_get_server_side_props",
  help: "Duration of getServerSideProps in seconds",
  labelNames: ["oboExchange"],
}).labels({ oboExchange: "idporten" });

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
  const end = histogram.startTimer();
  const bearerToken = context.req.headers.authorization;
  if (!bearerToken) {
    return {
      props: {
        foo: "Authorization header not found",
      },
    };
  }

  const session = await getSession(context.req);

  try {
    const oboToken = await session.apiToken(audience);
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
    end();
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
