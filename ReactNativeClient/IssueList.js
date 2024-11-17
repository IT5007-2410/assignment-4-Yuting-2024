import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  ScrollView,
} from 'react-native';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://10.0.2.2:3000/graphql', {
      // change the ip
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
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
      <View>
        {/* Q1: Start Coding here. */}
        <Text>Issue Filter Placeholder</Text>
        {/* Q1: Code ends here */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
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
  return (
    <View style={styles.row}>
      {/* let data be included in <Text> 中 */}
      <Text style={styles.cell}>{issue.id}</Text>
      <Text style={styles.cell}>{issue.title}</Text>
      <Text style={styles.cell}>{issue.status}</Text>
      <Text style={styles.cell}>{issue.owner}</Text>
      <Text style={styles.cell}>{issue.created.toDateString()}</Text>
      <Text style={styles.cell}>{issue.effort ? issue.effort.toString() : ''}</Text>
      <Text style={styles.cell}>{issue.due ? issue.due.toDateString() : ''}</Text>
    </View>
  );
}

function IssueTable(props) {
  const { issues } = props;

  return (
    <View style={styles.container}>
      {/* Q2: Start Coding here to render the table header/rows. */}
      {/* tablehead */}
      <View style={styles.header}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Title</Text>
        <Text style={styles.headerCell}>Status</Text>
        <Text style={styles.headerCell}>Owner</Text>
        <Text style={styles.headerCell}>Created</Text>
        <Text style={styles.headerCell}>Effort</Text>
        <Text style={styles.headerCell}>Due</Text>
      </View>
      {/* rowsdata */}
      <ScrollView style={styles.dataWrapper}>
        {issues.map((issue) => (
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
    this.state = {
      title: '',
      owner: '',
      effort: '',
    };
  }

  handleTitleChange = (text) => {
    this.setState({ title: text });
  };

  handleOwnerChange = (text) => {
    this.setState({ owner: text });
  };

  handleEffortChange = (text) => {
    this.setState({ effort: text });
  };

  handleSubmit() {
    const issue = {
      title: this.state.title,
      owner: this.state.owner,
      effort: parseInt(this.state.effort),
      due: new Date(),
    };
    this.props.createIssue(issue);
    this.setState({ title: '', owner: '', effort: '' });
  }

  render() {
    return (
      <View>
        {/* Q3: Start Coding here. */}
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
    this.state = {
      owner: '',
    };
  }

  handleOwnerChange = (text) => {
    this.setState({ owner: text });
  };

  async handleSubmit() {
    const query = `mutation addToBlackList($owner: String!) {
      addToBlackList(owner: $owner)
    }`;

    const data = await graphQLFetch(query, { owner: this.state.owner });
    if (data) {
      alert(`Added ${this.state.owner} to blacklist`);
      this.setState({ owner: '' });
    }
  }

  render() {
    return (
      <View>
        {/* Q4: Start Coding here. */}
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
