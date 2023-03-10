import * as React from "react";
import styled from "styled-components";
import { workoutVolume } from "../parser/parser";
import { Section } from "../types";
import bracket from "./Left_square_bracket.svg";

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
    border-bottom: thin solid #ccc;
  }
  .repeats {
    width: 35px;
    position: relative;
    border-bottom: none;
  }
`;

type P = {
  sections: Section[];
};
export const Workout = ({ sections }: P) => {
  return (
    <div>
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
                        {ex.repeats} &times; {ex.amount}
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
        </tbody>
      </Table>
      {workoutVolume(sections)} m
    </div>
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

const RepeatsContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  > div {
    background-size: 100% 100%;
    width: 10px;
    height: 100%;
    opacity: 0.5;
  }
`;

function LeftSquareBracketSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="100" version="1">
      <path d="M31.846 93.594c0 1.182-.135 2.015-.403 2.498-.269.483-.654.725-1.155.725h-13.75a4.05 4.05 0 01-1.235-.188 2.951 2.951 0 01-1.074-.618c-.323-.286-.582-.67-.78-1.154-.196-.484-.295-1.084-.294-1.8V8.247c0-.68.098-1.261.295-1.745.197-.483.456-.877.779-1.181.322-.305.68-.52 1.074-.645a4.054 4.054 0 011.235-.188h13.75c.215 0 .42.054.618.161.196.108.367.305.51.591.143.287.25.636.322 1.047.072.412.107.922.108 1.531 0 1.146-.135 1.97-.403 2.47-.269.502-.654.753-1.155.753h-8.755v79.277h8.755c.215 0 .42.054.618.161.196.108.367.296.51.564.143.269.25.609.322 1.02.072.412.107.923.108 1.531z"></path>
    </svg>
  );
}
