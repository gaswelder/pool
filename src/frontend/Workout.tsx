import * as React from "react";
import styled from "styled-components";
import { workoutVolume } from "../parser/parser";
import { Section } from "../types";
import bracket from "./Left_square_bracket.svg";
import { Theme } from "./theme";

const RepeatsContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 35px;
  > div {
    background-size: 100% 100%;
    width: 10px;
    height: 100%;
    opacity: 0.5;
  }
`;

const Tag = styled.span`
  display: inline-block;
  padding: 0 7px;
  margin: 0 2px;
  border-radius: 2px;
  font-size: 90%;
  color: ${(props) => props.color};
  border: thin solid ${(props) => props.color};
`;

const Table = styled.table`
  width: 100%;
  td,
  th {
    padding: 10px 4px;
    border-bottom: thin solid #d1dfec;
    font-size: ${Theme.fontSize};
  }
  .repeats {
    position: relative;
  }
  .repeats.open {
    width: 36px;
  }
`;

type P = {
  sections: Section[];
};
export const Workout = ({ sections }: P) => {
  const haveRepeats = sections.some((x) => x.repeats > 1);
  return (
    <Table>
      <tbody>
        {sections.map((section) => {
          return (
            <>
              {section.name && (
                <tr>
                  <th colSpan={3}>{section.name}</th>
                </tr>
              )}
              {section.ex.map((ex, j) => {
                return (
                  <tr key={`${j}`}>
                    {j == 0 && (
                      <td
                        rowSpan={section.ex.length}
                        className={["repeats", haveRepeats && "open"].join(" ")}
                      >
                        {section.repeats > 1 && (
                          <RepeatsContainer>
                            &times;{section.repeats}
                            <div
                              style={{ backgroundImage: `url(${bracket})` }}
                            ></div>
                          </RepeatsContainer>
                        )}
                      </td>
                    )}
                    <td>
                      {ex.repeats > 1 ? (
                        <>
                          {ex.repeats}&times;{ex.amount}
                        </>
                      ) : (
                        <>{ex.amount}</>
                      )}
                    </td>
                    <td>
                      {ex.desc}{" "}
                      {ex.equipment.map((item) => (
                        <Equipment key={item} id={item} />
                      ))}
                    </td>
                  </tr>
                );
              })}
            </>
          );
        })}
        <tr>
          <td></td>
          <td>
            <b>{workoutVolume(sections)}</b>
          </td>
          <td></td>
        </tr>
      </tbody>
    </Table>
  );
};

const Equipment = ({ id }: { id: string }) => {
  const colors: Record<string, string> = {
    buoy: "green",
    shortpaddles: "gold",
    paddles: "gray",
    bigpaddles: "red",
    kickboard: "blue",
    brakes: "gold",
    fins: "red",
  };
  return <Tag color={colors[id]}>{id}</Tag>;
};
