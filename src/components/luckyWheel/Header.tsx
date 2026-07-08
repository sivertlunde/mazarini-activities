import { FC } from "react"
import styled from "styled-components"

const HeaderContainer = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  padding-bottom: 100px;

  h1 {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: 0.04em;
    color: #ecd98d;
    text-shadow: 0 0 12px rgba(201, 162, 39, 0.55),
      0 0 28px rgba(201, 162, 39, 0.3), 0 2px 3px rgba(0, 0, 0, 0.6);
  }
`

export const Header: FC = () => (
  <HeaderContainer>
    <h1>Mazarini Lykkehjul</h1>
  </HeaderContainer>
)
