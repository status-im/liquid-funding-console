var inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        'Projects',
        'Funders',
        new inquirer.Separator(),
        'Tokens',
        new inquirer.Separator(),
        'Exit'
      ]
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers, null, '  '));
  });
