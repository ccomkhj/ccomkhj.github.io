#!/usr/bin/env ruby
# frozen_string_literal: true

# Front-matter check for posts: research provenance (`ai_researched`, `ai_research_note`)
# and Featured curation (`featured`, `featured_rank`). Runs in CI before the Jekyll build
# and fails with the file and field of every problem. It never edits or classifies posts.
#
#   ruby scripts/check_post_metadata.rb                        # _posts/ + the legacy allowlist
#   ruby scripts/check_post_metadata.rb --allowlist A [DIR...]  # other dirs/allowlists (fixtures)
#
# Rules: AGENTS.md "Provenance and Featured". Run via `just check-posts`.

require "date"
require "optparse"
require "yaml"

ROOT = File.expand_path("..", __dir__)
DEFAULT_ALLOWLIST = File.join(ROOT, "scripts", "legacy_unclassified_posts.txt")
POST_NAME = /\A\d{2,4}-\d{1,2}-\d{1,2}-.+\.(md|markdown)\z/ # Jekyll skips files not named like this
FRONT_MATTER = /\A(---\s*\n.*?\n?)^((---|\.\.\.)\s*$\n?)/m  # Jekyll's own pattern
PLACEHOLDER = /\A(tbd|tba|todo|fixme|xxx|placeholder|lorem ipsum.*|\.\.\.|…)\z/i

allowlists = []
OptionParser.new do |o|
  o.banner = "usage: check_post_metadata.rb [--allowlist FILE]... [DIR]..."
  o.on("--allowlist FILE", "grandfathered unclassified posts, one filename per line") { |f| allowlists << f }
end.parse!
allowlists = [DEFAULT_ALLOWLIST] if allowlists.empty?
dirs = ARGV.empty? ? [File.join(ROOT, "_posts")] : ARGV

errors = []
warnings = []

legacy = {}
allowlists.each do |list|
  File.readlines(list, chomp: true).each do |line|
    name = line.sub(/#.*/, "").strip
    legacy[name] = list unless name.empty?
  end
end

def rel(path)
  path.start_with?("#{ROOT}/") ? path.delete_prefix("#{ROOT}/") : path
end

def blank?(value)
  !value.is_a?(String) || value.strip.empty? || value.strip.match?(PLACEHOLDER)
end

posts = []
dirs.each do |dir|
  Dir.glob(File.join(dir, "*.{md,markdown}")).sort.each do |path|
    name = File.basename(path)
    next unless name.match?(POST_NAME)

    text = File.read(path, encoding: "utf-8")
    match = text.match(FRONT_MATTER)
    unless match
      errors << "#{rel(path)}: front matter: missing (the file must start with ---)"
      next
    end
    begin
      data = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
    rescue Psych::Exception => e
      errors << "#{rel(path)}: front matter: invalid YAML (#{e.message.lines.first.strip})"
      next
    end
    next if data["published"] == false # drafts are checked once they are published

    posts << { path: path, name: name, data: data }
  end
end

posts.each do |post|
  data, at = post[:data], rel(post[:path])
  ai = data["ai_researched"]
  grandfathered = legacy.key?(post[:name])

  if ai.nil?
    unless grandfathered
      errors << "#{at}: ai_researched: #{data.key?("ai_researched") ? "is null" : "missing"} — " \
                "new posts must set `ai_researched: true` or `false` " \
                "(only posts listed in #{rel(allowlists.first)} may stay unclassified)"
    end
  elsif ai != true && ai != false
    errors << "#{at}: ai_researched: must be an unquoted true or false, got #{ai.inspect}"
  elsif grandfathered
    warnings << "#{at}: classified now; its line in #{rel(legacy[post[:name]])} can be removed"
  end

  if data.key?("ai_research_note")
    note = data["ai_research_note"]
    if ai != true
      errors << "#{at}: ai_research_note: only allowed with `ai_researched: true` " \
                "(describe other AI use in the post body instead)"
    elsif blank?(note)
      errors << "#{at}: ai_research_note: must be a non-empty, non-placeholder string, got #{note.inspect} " \
                "(remove the key to use ai_research_default_note from _config.yml)"
    end
  end

  featured = data["featured"]
  if data.key?("featured") && featured != true && featured != false
    errors << "#{at}: featured: must be an unquoted true or false, got #{featured.inspect}"
  end

  if featured == true
    if ai != true && ai != false
      errors << "#{at}: featured: a Featured post needs `ai_researched: true` or `false` (unclassified posts can't be Featured)"
    end
    rank = data["featured_rank"]
    if !data.key?("featured_rank")
      errors << "#{at}: featured_rank: missing — a Featured post needs a unique positive integer rank (10, 20, 30…)"
    elsif !rank.is_a?(Integer) || rank <= 0
      errors << "#{at}: featured_rank: must be a positive integer, got #{rank.inspect}"
    end
    errors << "#{at}: title: a Featured post needs a title" if blank?(data["title"])
    if blank?(data["excerpt"])
      errors << "#{at}: excerpt: a Featured post needs a front-matter excerpt that describes it, got #{data["excerpt"].inspect}"
    end
  elsif data.key?("featured_rank")
    errors << "#{at}: featured_rank: only allowed with `featured: true` — remove it to unfeature the post"
  end
end

featured = posts.select { |p| p[:data]["featured"] == true && p[:data]["featured_rank"].is_a?(Integer) }
featured.group_by { |p| p[:data]["featured_rank"] }.each do |rank, same|
  next if same.size < 2

  same.each do |p|
    others = (same - [p]).map { |o| o[:name] }.join(", ")
    errors << "#{rel(p[:path])}: featured_rank: #{rank} is also used by #{others}; ranks must be unique"
  end
end

legacy.each do |name, list|
  next if dirs.any? { |dir| File.exist?(File.join(dir, name)) }

  warnings << "#{rel(list)}: #{name} is listed but no such post exists"
end

warnings.each { |w| warn "note: #{w}" }
errors.each { |e| warn "error: #{e}" }

counts = posts.map { |p| p[:data]["ai_researched"] }.tally
ranks = featured.map { |p| p[:data]["featured_rank"] }.sort
puts "checked #{posts.size} posts: #{counts[true] || 0} AI-researched, #{counts[false] || 0} not, " \
     "#{counts[nil] || 0} unclassified; #{ranks.size} Featured#{" (ranks #{ranks.join(", ")})" if ranks.any?}"
if errors.any?
  warn "#{errors.size} problem(s) in post front matter"
  exit 1
end
