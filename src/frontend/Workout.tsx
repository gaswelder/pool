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
    width: 36px;
  }
  .section-name th {
    font-weight: normal;
    font-style: italic;
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
                <tr className="section-name">
                  <th colSpan={haveRepeats ? 3 : 2}>{section.name}</th>
                </tr>
              )}
              {section.ex.map((ex, j) => {
                return (
                  <tr key={`${j}`}>
                    {j == 0 && haveRepeats && (
                      <td rowSpan={section.ex.length} className="repeats">
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
          {haveRepeats && <td></td>}
          <td>
            <b>{workoutVolume(sections)}</b>
          </td>
          <td></td>
        </tr>
      </tbody>
    </Table>
  );
};

const Tag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  font-size: 90%;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color};
  border-radius: ${Theme.borderRadius};
`;

const Equipment = ({ id }: { id: string }) => {
  const colors: Record<string, string> = {
    buoy: "green",
    "ankle-buoy": "green",
    shortpaddles: "orange",
    "small-paddles": "orange",
    paddles: "gray",
    bigpaddles: "red",
    kickboard: "blue",
    brakes: "greed",
    fins: "orange",
  };
  return <Tag color={colors[id]}>{id}</Tag>;
};
