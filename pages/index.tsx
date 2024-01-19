import "@navikt/ds-css";
import { Button, Heading, Popover } from "@navikt/ds-react";
import {
  grantTokenXOboToken
} from "@navikt/next-auth-wonderwall";
import { GetServerSideProps } from "next";
import { useRef, useState } from "react";

const Home = ({ foo }: { foo: string }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openState, setOpenState] = useState(false);

  return (
    <>
      <Heading size="xlarge">{foo}</Heading>

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
  const bearerToken = context.req.headers.authorization;
  if (!bearerToken) {
    return {
      props: {
        foo: "noooo",
      },
    };
  }

  // TODO: return error codes
  // const validationResult = await validateIdportenToken(bearerToken);

  const grantResult = await grantTokenXOboToken(
    (Array.isArray(bearerToken) ? bearerToken[0] : bearerToken).replace(
      "Bearer ",
      ""
    ),
    "dev-gcp:frontend-golden-path:frontend-golden-path-api"
  );
  if (typeof grantResult === "string") {
    const foo = await fetch("http://frontend-golden-path-api", {
      headers: {
        Authorization: grantResult,
      },
    }).then((res) => res.text());

    return {
      props: {
        foo,
      },
    };
  } else {
    return {
      props: {
        foo: "hmmm",
      },
    };
  }
};

export default Home;
