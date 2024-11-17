import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Button,
  useColorScheme,
  View,
} from 'react-native';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

async function graphQLFetch(query, variables = {}) {
  try {
    /* Q4: Start Coding here. State the correct IP/port */
    const response = await fetch('http://10.0.2.2:3000/graphql', {
      // const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    /* Q4: Code Ends here */
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class IssueFilter extends React.Component {
  render() {
    return (
      <>
        {/* Q1: Start Coding here. */}
        <View>
          <Text>Issue Filter Placeholder</Text>
        </View>
        {/* Q1: Code ends here */}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  header: { flexDirection: 'row', height: 50, backgroundColor: '#537791' },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 5,
  },
  row: { flexDirection: 'row', height: 40, backgroundColor: '#E7E6E1' },
  cell: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 5,
  },
  dataWrapper: { marginTop: -1 },
});

function IssueRow(props) {
  const issue = props.issue;
  /* Q2: Coding Starts here. Create a row of data in a variable */
  const data = [
    issue.id.toString(),
    issue.title,
    issue.status,
    issue.owner,
    issue.created.toDateString(),
    issue.effort ? issue.effort.toString() : '',
    issue.due ? issue.due.toDateString() : '',
  ];
  /* Q2: Coding Ends here. */
  return (
    <View style={styles.row}>
      {/* Q2: Start Coding here. Add Logic to render a row */}
      {data.map((cellData, index) => (
        <Text style={styles.cell} key={index}>
          {cellData}
        </Text>
      ))}
      {/* Q2: Coding Ends here. */}
    </View>
  );
}

function IssueTable(props) {
  /* Q2: Start Coding here. Add Logic to initialize table header */
  const tableHead = ['ID', 'Title', 'Status', 'Owner', 'Created', 'Effort', 'Due'];
  /* Q2: Coding Ends here. */

  return (
    <View style={styles.container}>
      {/* Q2: Start Coding here to render the table header/rows. */}
      {/* head */}
      <View style={styles.header}>
        {tableHead.map((headCell, index) => (
          <Text style={styles.headerCell} key={index}>
            {headCell}
          </Text>
        ))}
      </View>
      {/* datarows */}
      <ScrollView style={styles.dataWrapper}>
        {props.issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </ScrollView>
      {/* Q2: Coding Ends here. */}
    </View>
  );
}

class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    /* Q3: Start Coding here. Create State to hold inputs */
    this.state = {
      title: '',
      owner: '',
      effort: '',
    };
    /* Q3: Code Ends here. */
  }

  /* Q3: Start Coding here. Add functions to hold/set state input based on changes in TextInput */
  handleTitleChange = (text) => {
    this.setState({ title: text });
  };

  handleOwnerChange = (text) => {
    this.setState({ owner: text });
  };

  handleEffortChange = (text) => {
    this.setState({ effort: text });
  };
  /* Q3: Code Ends here. */

  handleSubmit() {
    /* Q3: Start Coding here. Create an issue from state variables and call createIssue. Also, clear input field in front-end */
    const issue = {
      title: this.state.title,
      owner: this.state.owner,
      effort: parseInt(this.state.effort),
      due: new Date(),
    };
    this.props.createIssue(issue);
    this.setState({ title: '', owner: '', effort: '' });
    /* Q3: Code Ends here. */
  }

  render() {
    return (
      <View>
        {/* Q3: Start Coding here. Create TextInput field, populate state variables. Create a submit button, and on submit, trigger handleSubmit. */}
        <TextInput
          placeholder="Title"
          value={this.state.title}
          onChangeText={this.handleTitleChange}
        />
        <TextInput
          placeholder="Owner"
          value={this.state.owner}
          onChangeText={this.handleOwnerChange}
        />
        <TextInput
          placeholder="Effort"
          value={this.state.effort}
          onChangeText={this.handleEffortChange}
          keyboardType="numeric"
        />
        <Button title="Add Issue" onPress={this.handleSubmit} />
        {/* Q3: Code Ends here. */}
      </View>
    );
  }
}

class BlackList extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    /* Q4: Start Coding here. Create State to hold inputs */
    this.state = {
      owner: '',
    };
    /* Q4: Code Ends here. */
  }
  /* Q4: Start Coding here. Add functions to hold/set state input based on changes in TextInput */
  handleOwnerChange = (text) => {
    this.setState({ owner: text });
  };
  /* Q4: Code Ends here. */

  async handleSubmit() {
    /* Q4: Start Coding here. Create an issue from state variables and issue a query. Also, clear input field in front-end */
    const query = `mutation addToBlackList($owner: String!) {
      addToBlackList(owner: $owner)
    }`;

    const data = await graphQLFetch(query, { owner: this.state.owner });
    if (data) {
      alert(`Added ${this.state.owner} to blacklist`);
      this.setState({ owner: '' });
    }
    /* Q4: Code Ends here. */
  }

  render() {
    return (
      <View>
        {/* Q4: Start Coding here. Create TextInput field, populate state variables. Create a submit button, and on submit, trigger handleSubmit. */}
        <TextInput
          placeholder="Owner to Blacklist"
          value={this.state.owner}
          onChangeText={this.handleOwnerChange}
        />
        <Button title="Add to Blacklist" onPress={this.handleSubmit} />
        {/* Q4: Code Ends here. */}
      </View>
    );
  }
}

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      issueList {
        id title status owner
        created effort due
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ issues: data.issueList });
    }
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
      issueAdd(issue: $issue) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { issue });
    if (data) {
      this.loadData();
    }
  }

  render() {
    return (
      <View>
        {/* Q1: Start Coding here. */}
        <IssueFilter />
        {/* Q1: Code ends here */}

        {/* Q2: Start Coding here. */}
        <IssueTable issues={this.state.issues} />
        {/* Q2: Code ends here */}

        {/* Q3: Start Coding here. */}
        <IssueAdd createIssue={this.createIssue} />
        {/* Q3: Code Ends here. */}

        {/* Q4: Start Coding here. */}
        <BlackList />
        {/* Q4: Code Ends here. */}
      </View>
    );
  }
}
