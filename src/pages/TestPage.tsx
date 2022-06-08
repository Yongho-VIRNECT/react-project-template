import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Test from "@/components/Test";

const Button = styled.button`
  color: black;
  background: orange;
`;

function TestPage() {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("test.tt")}</p>
      <Button>StyledButton</Button>
      <Test />
    </div>
  );
}

export default TestPage;
