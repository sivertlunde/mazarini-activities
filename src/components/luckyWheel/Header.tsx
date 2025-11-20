import { FC } from "react"
import styled from "styled-components"

const HeaderContainer = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`

export const Header: FC = () => (
  <HeaderContainer>
    <h1>Lykkehjul</h1>
  </HeaderContainer>
)
