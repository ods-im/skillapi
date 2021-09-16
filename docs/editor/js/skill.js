/**
 * Represents the data for a dynamic skill
 *
 * @param {string} name - the name of the skill
 *
 * @constructor
 */
function Skill(name)
{
	this.components = [];

	// Included to simplify code when adding components
	this.html = document.getElementById('builderContent');
	
	this.dataKey = 'attributes';
	this.componentKey = 'components';
	
	// Skill data
	this.data = [
		new StringValue('名称', 'name', name).setTooltip('技能名称。 这不应包含颜色代码'),
		new StringValue('类型', 'type', 'Dynamic').setTooltip('描述技能的特色，例如“AOE 范围伤害”或您想要的任何内容'),
		new IntValue('最高等级', 'max-level', 5).setTooltip('技能可以达到的最高等级'),
		new ListValue('技能要求', 'skill-req', ['None'], 'None').setTooltip('需要升级的技能才能解锁'),
		new IntValue('技能等级要求', 'skill-req-lvl', 1).setTooltip('所需技能需要达到的等级才能解锁此技能'),
		new ListValue('权限', 'needs-permission', ['True', 'False'], 'False').setTooltip('此技能是否需要解锁权限。 权限节点是 "skillapi.skill.{skillName}"'),
		new AttributeValue('职业等级要求', 'level', 1, 0).setTooltip('玩家在解锁或升级此技能之前需要达到的职业等级'),
		new AttributeValue('消耗技能点', 'cost', 1, 0).setTooltip('解锁和升级此技能所需的技能点数'),
		new AttributeValue('冷却时间', 'cooldown', 0, 0).setTooltip('再次施放技能前的时间（以秒为单位） (仅适用于施法 触发器)'),
		new AttributeValue('魔力', 'mana', 0, 0).setTooltip('施放技能所需的法力值（仅适用于施法触发器）'),
		new AttributeValue('最低消耗', 'points-spent-req', 0, 0).setTooltip('升级该技能前需要消耗的技能点数'),
		new StringValue('施法消息', 'msg', '&6{player} &2投入到 &6{skill}').setTooltip('施放技能时向施法者周围的玩家显示的消息。 该区域的半径在 config.yml 选项中'),
        new StringValue('组合', 'combo', '').setTooltip('用于分配技能的单击组合（如果已启用）。 使用 L、R、S、LS、RS、P、Q 和 F 表示由空格分隔的点击类型。 例如，“L L R R”适用于 4 次点击组合.'),
        new ListValue('指标', 'indicator', [ '2D', '3D', 'None' ], '2D').setTooltip('用于投射预览的显示类型。 这适用于铸造栏设置中的“悬停栏”.'),
		new ListValue('图标', 'icon', getMaterials, 'Jack O Lantern').setTooltip('技能树中用来表示技能的物品'),
		new IntValue('图标值', 'icon-data', 0).setTooltip('图标的数据/耐久性值（低于 1.14）或 CustomModelData（在 1.14+ 中）.'),
		new StringListValue('图标的Lore', 'icon-lore', [
			'&d{name} &7({level}/{max})',
			'&2类型: &6{type}',
			'',
			'{req:level}等级: {attr:level}',
			'{req:cost}成本: {attr:cost}',
			'',
			'&2魔力: {attr:mana}',
			'&2冷却: {attr:cooldown}'
		]).setTooltip('技能树中显示的项目描述。 包括力学值，例如使用其"Icon Key"值造成的伤害'),
		new StringListValue('冲突', 'incompatible', []).setTooltip('不得为了升级此技能而升级的技能列表')
	];
}

/**
 * Applies the skill data to the HTML page, overwriting any previous data
 */ 
Skill.prototype.apply = function() 
{
	var builder = document.getElementById('builderContent');
	builder.innerHTML = '';
	
	// Set up the builder content
	for (var i = 0; i < this.components.length; i++)
	{
		this.components[i].createBuilderHTML(builder);
	}
}

/**
 * Creates the form HTML for editing the skill and applies it to
 * the appropriate area on the page
 */
Skill.prototype.createFormHTML = function()
{
	var form = document.createElement('form');
	
	var header = document.createElement('h4');
	header.innerHTML = '技能详情';
	form.appendChild(header);
	
    form.appendChild(document.createElement('hr'));
    form.appendChild(this.createEditButton(form));
    form.appendChild(document.createElement('hr'));
	
	this.data[3].list.splice(1, this.data[3].list.length - 1);
	for (var i = 0; i < skills.length; i++)
	{
		if (skills[i] != this) 
		{
			this.data[3].list.push(skills[i].data[0].value);
		}
	}
	for (var i = 0; i < this.data.length; i++)
	{
		this.data[i].createHTML(form);
	}
	
	var hr = document.createElement('hr');
	form.appendChild(hr);
	
	form.appendChild(this.createEditButton(form));
	
	var target = document.getElementById('skillForm');
	target.innerHTML = '';
	target.appendChild(form);
}

Skill.prototype.createEditButton = function(form) {
    var done = document.createElement('h5');
	done.className = 'doneButton';
	done.innerHTML = '编辑效果',
	done.skill = this;
	done.form = form;
	done.addEventListener('click', function(e) {
		this.skill.update();
		var list = document.getElementById('skillList');
		list[list.selectedIndex].text = this.skill.data[0].value;
		this.form.parentNode.removeChild(this.form);
		showSkillPage('builder');
	});
    return done;
}

/**
 * Updates the skill data from the details form if it exists
 */
Skill.prototype.update = function()
{
	var index;
	var list = document.getElementById('skillList');
	for (var i = 0; i < skills.length; i++)
	{
		if (skills[i] == this)
		{
			index = i;
			break;
		}
	}
	var prevName = this.data[0].value;
	for (var j = 0; j < this.data.length; j++)
	{
		this.data[j].update();
	}
	var newName = this.data[0].value;
	this.data[0].value = prevName;
	if (isSkillNameTaken(newName)) return;
	this.data[0].value = newName;
	list[index].text = this.data[0].value;
}

/**
 * Checks whether or not the skill is using a given trigger
 *
 * @param {string} trigger - name of the trigger to check
 *
 * @returns {boolean} true if using it, false otherwise
 */ 
Skill.prototype.usingTrigger = function(trigger)
{
	for (var i = 0; i < this.components.length; i++)
	{
		if (this.components[i].name == trigger) return true;
	}
	return false;
}

/**
 * Creates and returns a save string for the skill
 */ 
Skill.prototype.getSaveString = function()
{
	var saveString = '';
	
	saveString += this.data[0].value + ":\n";
	for (var i = 0; i < this.data.length; i++)
	{
		if (isAttribute(this.data[i])) continue;
		saveString += this.data[i].getSaveString('  ');
	}
	saveString += '  attributes:\n';
	for (var i = 0; i < this.data.length; i++)
	{
		if (isAttribute(this.data[i]))
		{
			saveString += this.data[i].getSaveString('    ');
		}
	}
	if (this.components.length > 0)
	{
		saveString += '  components:\n';
		saveIndex = 0;
		for (var i = 0; i < this.components.length; i++)
		{
			saveString += this.components[i].getSaveString('    ');
		}
	}
	return saveString;
}

function isAttribute(input) {
    return (input instanceof AttributeValue) || (input.key == 'incompatible');
}

/**
 * Loads skill data from the config lines stating at the given index
 *
 * @param {YAMLObject} data - the data to load
 *
 * @returns {Number} the index of the last line of data for this skill
 */
Skill.prototype.load = function(data)
{
	if (data.active || data.embed || data.passive)
	{
		// Load old skill config for conversion
	}
	else 
	{
		this.loadBase(data);
	}
}

Skill.prototype.loadBase = loadSection;

/**
 * Creates a new skill and switches the view to it
 *
 * @returns {Skill} the new skill
 */ 
function newSkill()
{
	var id = 1;
	while (isSkillNameTaken('Skill ' + id)) id++;
	
	activeSkill = addSkill('Skill ' + id);
	
	var list = document.getElementById('skillList');
	list.selectedIndex = list.length - 2;
	
	activeSkill.apply();
	activeSkill.createFormHTML();
	showSkillPage('skillForm');
	
	return activeSkill;
}

/**
 * Adds a skill to the editor without switching the view to it
 *
 * @param {string} name - the name of the skill to add
 *
 * @returns {Skill} the added skill
 */ 
function addSkill(name) 
{
	var skill = new Skill(name);
	skills.push(skill);
	
	var option = document.createElement('option');
	option.text = name;
	var list = document.getElementById('skillList');
	list.add(option, list.length - 1);
	
	return skill;
}

/**
 * Checks whether or not a skill name is currently taken
 *
 * @param {string} name - name to check for
 *
 * @returns {boolean} true if the name is taken, false otherwise
 */ 
function isSkillNameTaken(name)
{
	return getSkill(name) != null;
}

/**
 * Retrieves a skill by name
 *
 * @param {string} name - name of the skill to retrieve
 *
 * @returns {Skill} the skill with the given name or null if not found
 */
function getSkill(name)
{
	name = name.toLowerCase();
	for (var i = 0; i < skills.length; i++)
	{
		if (skills[i].data[0].value.toLowerCase() == name) return skills[i];
	}
	return null;
}


var activeSkill = new Skill('Skill 1');
var activeComponent = undefined;
var skills = [activeSkill];
activeSkill.createFormHTML();
showSkillPage('skillForm');
