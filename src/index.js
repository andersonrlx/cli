import { Command } from 'commander';
import inquirer from 'inquirer';
import { generateFromTemplate, listTemplates, useTemplateRepo, loadTemplateSchema } from './generator.js';

const program = new Command();

program
  .name('infra')
  .description('CLI para gerar boilerplates de Kubernetes e Terraform')
  .version('1.1.0');

program
  .command('use-repo')
  .description('Baixa/atualiza um repositório de templates (Git)')
  .requiredOption('--repo <url>', 'URL Git (SSH ou HTTPS)')
  .option('--ref <ref>', 'branch/tag/commit', 'main')
  .action(async (opts) => {
    const dir = await useTemplateRepo(opts.repo, opts.ref);
    console.log(`✔️ Templates disponíveis em: ${dir}`);
  });

program
  .command('templates')
  .description('Lista templates disponíveis')
  .option('-t, --type <type>', 'Tipo (k8s|terraform)')
  .action(async (opts) => {
    if (!opts.type) return console.log('Tipos suportados: k8s, terraform');
    const templates = await listTemplates(opts.type);
    console.log(`Templates de ${opts.type}:`);
    templates.forEach(t => console.log(` - ${t}`));
  });

program
  .command('new')
  .description('Gera um novo artefato a partir de um template')
  .option('-t, --type <type>', 'k8s|terraform')
  .option('--template <template>', 'nome do template')
  .option('-n, --name <name>', 'nome do serviço/projeto')
  .option('-o, --outdir <outdir>', 'diretório de saída', './out')
  .option('--vars <json>', 'variáveis em JSON')
  .action(async (opts) => {
    const types = ['k8s','terraform'];
    const type = opts.type && types.includes(opts.type) ? opts.type :
      (await inquirer.prompt([{type:'list',name:'type',message:'Selecione o tipo:',choices:types}])).type;

    const templates = await listTemplates(type);
    if (!templates.length) {
      console.log('Nenhum template encontrado. Crie a pasta templates/ ou rode: infra use-repo --repo <git>');
      process.exit(1);
    }
    const template = (opts.template && templates.includes(opts.template)) ? opts.template :
      (await inquirer.prompt([{type:'list',name:'template',message:'Selecione o template:',choices:templates}])).template;

    // carrega schema do template (perguntas dirigidas)
    const schema = await loadTemplateSchema(type, template); // pode ser null

    let baseAnswers = {};
    if (schema?.questions?.length) {
      baseAnswers = await inquirer.prompt(schema.questions);
    }

    let name = opts.name || baseAnswers.name;
    if (!name) name = (await inquirer.prompt([{type:'input',name:'name',message:'Nome do serviço/projeto:'}])).name;

    let extraVars = {};
    if (opts.vars) {
      try { extraVars = JSON.parse(opts.vars); } catch (e) { console.error('JSON inválido em --vars'); process.exit(1); }
    }

    const defaults = schema?.defaults || {};
    const variables = { name, ...defaults, ...baseAnswers, ...extraVars };

    await generateFromTemplate({ type, template, variables, outdir: opts.outdir });
    console.log(`✔️ Gerado com sucesso em: ${opts.outdir}/${type}/${name}`);
  });

program.parse(process.argv);
