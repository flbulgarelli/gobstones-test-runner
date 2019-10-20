require "spec_helper"

describe Gobstones::TestRunner do
  it { expect(File.exist? Gobstones::TestRunner.assets_path_for('javascripts/gobstones-test-runner.js')).to be true }
end
