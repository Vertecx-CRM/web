interface IColors {
  buttons: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  texts: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    quinary: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  table: {
    primary: string;
    lines: string;
    header: string;
  };
  asideNavBackground: {
    primary: string;
  };
  states: {
    success: string;
    pending: string;
    inactive: string;
    nullable: string;
  };
  calendar: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
}
const Colors: IColors = {
  buttons: {
    primary: "#CC0000",
    secondary: "#6c757d",
    tertiary: "#7C7C7C",
    quaternary: "#000000",
  },
  texts: {
    primary: "#0D141C",
    secondary: "#B20000",
    tertiary: "#3f4445",
    quaternary: "#ffffff",
    quinary: "#717680",
  },
  background: {
    primary: "#E8E8E8",
    secondary: "#F2F2F2",
    tertiary: "##626262",
  },
  table: {
    primary: "#ffffff",
    lines: "#E6E6E6",
    header: "#F4F4F4",
  },
  asideNavBackground: {
    primary: "#B20000",
  },
  states: {
    success: "#189416",
    pending: "#FFBB00",
    inactive: "#FF0000",
    nullable: "#B20000",
  },
  calendar: {
    primary: "#b20000",
    secondary: "#ffd6d6",
    tertiary: "#ffffff",
    quaternary: "#f4f4f4",
  },
};

export default Colors;
