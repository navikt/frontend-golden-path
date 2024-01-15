import "@navikt/ds-css";
import { useRef, useState } from "react";
import { Button, Popover } from "@navikt/ds-react";

const Home =  () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openState, setOpenState] = useState(false);

  return (
    <>
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
export default Home