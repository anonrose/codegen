import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Prop {
  name: string;
  type: string;
}

const generateContextCode = (contextName: string, props: Prop[], filePath: string) => {
  const propsInterface = `interface ${contextName}Props {
${props.map(({ name, type }) => `  ${name}: ${type};`).join("\n")}
}`;

  const code = `import React, { createContext, useContext, useState, ReactNode } from 'react';

${propsInterface}

interface ${contextName}ContextType {
  state: ${contextName}Props;
  setState: React.Dispatch<React.SetStateAction<${contextName}Props>>;
}

const ${contextName}Context = createContext<${contextName}ContextType | undefined>(undefined);

export const ${contextName}Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<${contextName}Props>({} as ${contextName}Props);

  return (
    <${contextName}Context.Provider value={{ state, setState }}>
      {children}
    </${contextName}Context.Provider>
  );
};

export const use${contextName} = (): ${contextName}ContextType => {
  const context = useContext(${contextName}Context);
  if (!context) {
    throw new Error('use${contextName} must be used within a ${contextName}Provider');
  }
  return context;
};
`;

  const fileName = `${contextName}Context.tsx`;
  fs.writeFileSync(filePath, code, "utf8");
  console.log(`${fileName} generated at ${filePath}`);
};

// Parse CLI arguments using yargs
const argv = yargs(hideBin(process.argv))
  .option("context", {
    alias: "c",
    type: "string",
    description: "Name of the context",
    demandOption: true,
  })
  .option("props", {
    alias: "p",
    type: "string",
    description: "Comma-separated list of props in the format name:type",
    demandOption: true,
  })
  .option("path", {
    alias: "pa",
    type: "string",
    description: "Path to the file",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

const args = await argv;
const contextName: string = args.context;
const props: Prop[] = args.props.split(",").map((prop: string) => {
  const [name, type] = prop.split(":");
  return { name, type };
});
const filePath: string = args.path;

generateContextCode(contextName, props, filePath);
