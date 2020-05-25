import React from "react";
import { graphql } from "gatsby";
import {
  InteractiveForceGraph,
  ForceGraphNode,
  ForceGraphLink,
} from "react-vis-force";
import Layout from "../layouts/index";

const GraphOverview = ({ data, location }) => {
  return (
    <Layout location={location}>
      <InteractiveForceGraph
        onSelectNode={(ev) => console.log(ev)}
        zoom
        simulationOptions={
          typeof window !== "undefined"
            ? {
                height: window.innerHeight - 41 - 16 - 30,
                width: Math.min(window.innerWidth, 640),
              }
            : undefined
        }
        labelAttr={"title"}
      >
        {data.allRoamPage.nodes.map((node) => (
          <ForceGraphNode
            key={node.id}
            node={{ id: node.id, title: node.title, radius: 5 }}
          />
        ))}
        {data.allRoamPage.nodes
          .reduce((prev, node) => {
            node.childMdx.outboundReferences.forEach(({ parent: ref }) => {
              if (!ref.fields) {
                if (
                  ref.id !== node.id &&
                  !prev.find((x) => x.source === node.id && x.target === ref.id)
                ) {
                  prev.push({
                    source: node.id,
                    target: ref.id,
                    value: 2,
                  });
                }
              } else {
                if (
                  ref.fields.parentPage.id !== node.id &&
                  !prev.find(
                    (x) =>
                      x.source === node.id &&
                      x.target === ref.fields.parentPage.id
                  )
                ) {
                  prev.push({
                    source: node.id,
                    target: ref.fields.parentPage.id,
                    value: 2,
                  });
                }
              }
            });
            return prev;
          }, [])
          .map((link) => (
            <ForceGraphLink
              key={`${link.source}=>${link.target}`}
              link={link}
            />
          ))}
      </InteractiveForceGraph>
    </Layout>
  );
};

export default GraphOverview;

export const pageQuery = graphql`
  query {
    allRoamPage {
      nodes {
        id
        title
        childMdx {
          outboundReferences {
            ... on Mdx {
              parent {
                id
                ... on RoamBlock {
                  fields {
                    parentPage {
                      id
                    }
                  }
                }
              }
            }
          }
        }
        fields {
          slug
        }
      }
    }
  }
`;