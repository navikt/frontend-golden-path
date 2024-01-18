import "@navikt/ds-css";
import { useRef, useState } from "react";
import { Button, Heading, Popover } from "@navikt/ds-react";
import { GetServerSideProps, NextApiRequest } from "next";
import {
  grantTokenXOboToken,
  validateIdportenToken,
} from "@navikt/next-auth-wonderwall";

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
  const bearerToken = context.req.headers["Authorization"];
  console.log(context.req);
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
    process.env.FRONTEND_GOLDEN_PATH_API_SCOPE as string
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
