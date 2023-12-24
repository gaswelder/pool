import styled from "styled-components";
import { ESet } from "../parser/shorthand";
import { Collapsible } from "./Collapsible";
import { Theme } from "./theme";
import { WorkoutTable } from "./WorkoutTable";

const ContainerDiv = styled.div`
  & button {
    margin-top: ${Theme.h};
    margin-left: auto;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;

type P = {
  sets: ESet[];
};

export const Review = ({ sets }: P) => {
  return (
    <>
      <h3>Review</h3>
      <p>{sets.length} sets</p>
      {sets.map((set, i) => {
        return (
          <Collapsible
            key={i}
            header={() => <Title>{set.name}</Title>}
            content={() => (
              <ContainerDiv>
                <WorkoutTable workout={[set]} />
              </ContainerDiv>
            )}
          />
        );
      })}
    </>
  );
};
